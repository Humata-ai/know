import { useMemo, memo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import type { Property, QualityDomain } from '../../shared/types'
import { isPoint } from '../../shared/types'
import { useQualityDomain } from '@/app/store'
import type { ThreeEvent } from '@react-three/fiber'
import { useCursorOnHover } from '@/app/hooks/useCursorOnHover'
import { areLabelDimensionsEqual, areDimensionsEqual } from '@/app/utils/equality'
import LabelBillboard from '../../shared/LabelBillboard'

interface AxisData {
  dimension: { id: string; name: string; range: readonly [number, number] }
  angle: number
  endX: number
  endY: number
  minValue: number
  maxValue: number
}

interface LabelVisualizationSpiderProps {
  label: Property
  domain: QualityDomain
  index: number
  isSelected?: boolean
  axisData: AxisData[]
  spiderRadius: number
}

const LABEL_COLORS = [
  '#10b981', // Emerald green
  '#a855f7', // Purple
  '#3b82f6', // Blue
  '#f59e0b', // Amber/Orange
  '#ec4899', // Pink
  '#06b6d4', // Cyan
]

function LabelVisualizationSpider({
  label,
  domain,
  index,
  isSelected = false,
  axisData,
  spiderRadius,
}: LabelVisualizationSpiderProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { selectLabel } = useQualityDomain()
  const cursorHandlers = useCursorOnHover()

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectLabel(domain.id, label.id)
  }

  // Calculate the positions on the spider graph for this label (in XY plane)
  const { points, centerPosition, isPointLabel } = useMemo(() => {
    const points: THREE.Vector3[] = []
    let sumX = 0
    let sumY = 0
    let validPoints = 0

    axisData.forEach((axis) => {
      const labelDim = label.dimensions.find((d) => d.dimensionId === axis.dimension.id)
      
      if (!labelDim) {
        // If dimension is not defined in the label, use the minimum value
        const normalizedValue = 0
        const x = Math.cos(axis.angle) * spiderRadius * normalizedValue
        const y = Math.sin(axis.angle) * spiderRadius * normalizedValue
        points.push(new THREE.Vector3(x, y, 0))
        return
      }

      let normalizedValue: number

      if ('value' in labelDim) {
        // Point dimension - use exact value
        const value = labelDim.value
        normalizedValue = (value - axis.minValue) / (axis.maxValue - axis.minValue)
      } else if ('range' in labelDim) {
        // Region dimension - use center of range
        const [rangeMin, rangeMax] = labelDim.range
        const centerValue = (rangeMin + rangeMax) / 2
        normalizedValue = (centerValue - axis.minValue) / (axis.maxValue - axis.minValue)
      } else {
        normalizedValue = 0
      }

      // Clamp to [0, 1]
      normalizedValue = Math.max(0, Math.min(1, normalizedValue))

      const x = Math.cos(axis.angle) * spiderRadius * normalizedValue
      const y = Math.sin(axis.angle) * spiderRadius * normalizedValue
      points.push(new THREE.Vector3(x, y, 0))
      
      sumX += x
      sumY += y
      validPoints++
    })

    const centerPosition = new THREE.Vector3(
      validPoints > 0 ? sumX / validPoints : 0,
      validPoints > 0 ? sumY / validPoints : 0,
      0
    )

    const isPointLabel = isPoint(label)

    return { points, centerPosition, isPointLabel }
  }, [label, axisData, spiderRadius])

  const color = isSelected ? '#3b82f6' : LABEL_COLORS[index % LABEL_COLORS.length]

  useLayoutEffect(() => {
    if (!groupRef.current) return

    const group = groupRef.current

    // Clear existing children to avoid duplicates
    while (group.children.length > 0) {
      const child = group.children[0]
      group.remove(child)
      if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.LineLoop) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    }

    if (isPointLabel) {
      // For points, draw the spider polygon and a sphere at the center
      const geometry = new THREE.BufferGeometry().setFromPoints([...points, points[0]])
      const lineMaterial = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 2,
        opacity: 0.8,
        transparent: true,
      })
      const line = new THREE.LineLoop(geometry, lineMaterial)
      group.add(line)

      // Add a sphere at the center
      const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16)
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.copy(centerPosition)
      group.add(sphere)

      return () => {
        geometry.dispose()
        lineMaterial.dispose()
        sphereGeometry.dispose()
        sphereMaterial.dispose()
      }
    } else {
      // For regions, draw filled polygon with transparency (in XY plane)
      // Create a shape from the points
      const shape = new THREE.Shape()
      if (points.length > 0) {
        shape.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
          shape.lineTo(points[i].x, points[i].y)
        }
        shape.lineTo(points[0].x, points[0].y)
      }

      const shapeGeometry = new THREE.ShapeGeometry(shape)
      const shapeMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(shapeGeometry, shapeMaterial)
      // No rotation needed - already in XY plane
      group.add(mesh)

      // Also draw the outline
      const outlineGeometry = new THREE.BufferGeometry().setFromPoints([...points, points[0]])
      const outlineMaterial = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3,
        opacity: 1,
      })
      const outline = new THREE.LineLoop(outlineGeometry, outlineMaterial)
      group.add(outline)

      return () => {
        shapeGeometry.dispose()
        shapeMaterial.dispose()
        outlineGeometry.dispose()
        outlineMaterial.dispose()
      }
    }
  }, [points, color, centerPosition, isPointLabel])

  const labelPosition = useMemo(
    () => [centerPosition.x, centerPosition.y, 1.5] as const,
    [centerPosition.x, centerPosition.y]
  )

  return (
    <>
      <group ref={groupRef} onClick={handleClick} {...cursorHandlers} />

      {label.name && (
        <LabelBillboard
          position={[...labelPosition] as [number, number, number]}
          text={label.name}
          fontSize={1.5}
          color={color}
        />
      )}
    </>
  )
}

const areEqual = (
  prevProps: LabelVisualizationSpiderProps,
  nextProps: LabelVisualizationSpiderProps
) => {
  return (
    prevProps.label.id === nextProps.label.id &&
    prevProps.index === nextProps.index &&
    prevProps.domain.id === nextProps.domain.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.spiderRadius === nextProps.spiderRadius &&
    areLabelDimensionsEqual(prevProps.label.dimensions, nextProps.label.dimensions) &&
    areDimensionsEqual(prevProps.domain.dimensions, nextProps.domain.dimensions)
  )
}

export default memo(LabelVisualizationSpider, areEqual)
