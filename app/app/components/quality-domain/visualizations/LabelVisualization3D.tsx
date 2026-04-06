import { useMemo, memo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import type { QualityDomainLabel, QualityDomain } from '../../shared/types'
import { isRegion, isPoint } from '../../shared/types'
import { useQualityDomain } from '@/app/store'
import type { ThreeEvent } from '@react-three/fiber'
import { useCursorOnHover } from '@/app/hooks/useCursorOnHover'
import { areLabelDimensionsEqual, areDimensionsEqual } from '@/app/utils/equality'
import LabelBillboard from '../../shared/LabelBillboard'

interface LabelVisualization3DProps {
  label: QualityDomainLabel
  domain: QualityDomain
  index: number
  isSelected?: boolean
}

const LABEL_COLORS = [
  '#10b981', // Emerald green
  '#a855f7', // Purple
  '#3b82f6', // Blue
  '#f59e0b', // Amber/Orange
  '#ec4899', // Pink
  '#06b6d4', // Cyan
]

function LabelVisualization3D({
  label,
  domain,
  index,
  isSelected = false,
}: LabelVisualization3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { selectLabel } = useQualityDomain()
  const cursorHandlers = useCursorOnHover()

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectLabel(domain.id, label.id)
  }

  const { ranges, position, isPointLabel } = useMemo(() => {
    const ranges = domain.dimensions.map((dim, idx) => {
      const labelDim = label.dimensions.find((d) => d.dimensionId === dim.id)
      const [dimMin, dimMax] = dim.range

      if (labelDim && 'value' in labelDim) {
        const value = labelDim.value
        const pos = -4 + ((value - dimMin) / (dimMax - dimMin)) * 8
        return { min: pos, max: pos, center: pos, size: 0 }
      } else {
        const labelRange = (labelDim && 'range' in labelDim) ? labelDim.range : dim.range
        const min = -4 + ((labelRange[0] - dimMin) / (dimMax - dimMin)) * 8
        const max = -4 + ((labelRange[1] - dimMin) / (dimMax - dimMin)) * 8
        return { min, max, center: (min + max) / 2, size: max - min }
      }
    })

    const position = new THREE.Vector3(ranges[0].center, ranges[1].center, ranges[2].center)
    const isPointLabel = isPoint(label)

    return { ranges, position, isPointLabel }
  }, [label, domain.dimensions])

  const color = isSelected ? '#3b82f6' : LABEL_COLORS[index % LABEL_COLORS.length]

  useLayoutEffect(() => {
    if (!groupRef.current) return

    const group = groupRef.current

    // Clear existing children to avoid duplicates
    while (group.children.length > 0) {
      const child = group.children[0]
      group.remove(child)
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    }

    if (isPointLabel) {
      // Render point as sphere
      const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16)
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.7
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.copy(position)
      group.add(sphere)

      return () => {
        sphereGeometry.dispose()
        sphereMaterial.dispose()
      }
    } else {
      // Render region as edges
      const boxGeometry = new THREE.BoxGeometry(ranges[0].size, ranges[1].size, ranges[2].size)
      const edgesGeometry = new THREE.EdgesGeometry(boxGeometry)
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3,
        opacity: 1
      })
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
      edges.position.copy(position)
      group.add(edges)

      return () => {
        boxGeometry.dispose()
        edgesGeometry.dispose()
        edgesMaterial.dispose()
      }
    }
  }, [ranges, color, position, isPointLabel])

  const labelPosition = useMemo(
    () => isPointLabel
      ? [position.x, position.y + 1.5, position.z] as const
      : [position.x, position.y + ranges[1].size / 2 + 1.5, position.z] as const,
    [position.x, position.y, position.z, ranges, isPointLabel]
  )

  return (
    <>
      <group
        ref={groupRef}
        onClick={handleClick}
        {...cursorHandlers}
      />

      {label.name && (
        <LabelBillboard
          position={labelPosition}
          text={label.name}
          fontSize={1.5}
          color={color}
        />
      )}
    </>
  )
}

const areEqual = (prevProps: LabelVisualization3DProps, nextProps: LabelVisualization3DProps) => {
  return (
    prevProps.label.id === nextProps.label.id &&
    prevProps.index === nextProps.index &&
    prevProps.domain.id === nextProps.domain.id &&
    prevProps.isSelected === nextProps.isSelected &&
    areLabelDimensionsEqual(prevProps.label.dimensions, nextProps.label.dimensions) &&
    areDimensionsEqual(prevProps.domain.dimensions, nextProps.domain.dimensions)
  )
}

export default memo(LabelVisualization3D, areEqual)
