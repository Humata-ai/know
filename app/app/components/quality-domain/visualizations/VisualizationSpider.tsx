import { useMemo, memo } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { QualityDomain } from '../../shared/types'
import LabelVisualizationSpider from './LabelVisualizationSpider'
import { useQualityDomain } from '@/app/store'
import type { ThreeEvent } from '@react-three/fiber'
import { useCursorOnHover } from '@/app/hooks/useCursorOnHover'

interface VisualizationSpiderProps {
  domain: QualityDomain
}

const SPIDER_RADIUS = 5 // Radius of the spider graph

function VisualizationSpider({ domain }: VisualizationSpiderProps) {
  const { selectDomain, state } = useQualityDomain()
  const cursorHandlers = useCursorOnHover()

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectDomain(domain.id)
  }

  const dimensionCount = domain.dimensions.length

  // Calculate positions for each axis in a circular layout (upright in XY plane)
  const axisData = useMemo(() => {
    return domain.dimensions.map((dim, index) => {
      const angle = (index / dimensionCount) * Math.PI * 2 - Math.PI / 2 // Start from top
      const endX = Math.cos(angle) * SPIDER_RADIUS
      const endY = Math.sin(angle) * SPIDER_RADIUS
      const [minValue, maxValue] = dim.range

      return {
        dimension: dim,
        angle,
        endX,
        endY,
        minValue,
        maxValue,
      }
    })
  }, [domain.dimensions, dimensionCount])

  // Create concentric circles for the grid (in XY plane)
  const concentricCircles = useMemo(() => {
    const circles = []
    const numCircles = 5
    
    for (let i = 1; i <= numCircles; i++) {
      const radius = (i / numCircles) * SPIDER_RADIUS
      const points = []
      const segments = 64
      
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI * 2
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
          )
        )
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      circles.push(
        <lineLoop key={`circle-${i}`} geometry={geometry}>
          <lineBasicMaterial color="#d1d5db" opacity={0.3} transparent />
        </lineLoop>
      )
    }
    
    return circles
  }, [])

  return (
    <group onClick={handleClick} {...cursorHandlers}>
      {/* Concentric circles */}
      {concentricCircles}

      {/* Axes and labels */}
      {axisData.map((axis, index) => (
        <group key={axis.dimension.id}>
          {/* Axis line */}
          <mesh
            position={[axis.endX / 2, axis.endY / 2, 0]}
            rotation={[0, 0, axis.angle + Math.PI / 2]}
          >
            <cylinderGeometry args={[0.03, 0.03, SPIDER_RADIUS]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>

          {/* Endpoint sphere */}
          <mesh position={[axis.endX, axis.endY, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>

          {/* Dimension name */}
          <Text
            position={[axis.endX * 1.3, axis.endY * 1.3, 0]}
            fontSize={0.5}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {axis.dimension.name}
          </Text>

          {/* Min value (at center) */}
          <Text
            position={[axis.endX * 0.1, axis.endY * 0.1, 0]}
            fontSize={0.25}
            color="#374151"
            anchorX="center"
            anchorY="middle"
          >
            {axis.minValue.toString()}
          </Text>

          {/* Max value (at endpoint) */}
          <Text
            position={[axis.endX * 1.15, axis.endY * 1.15, 0]}
            fontSize={0.25}
            color="#374151"
            anchorX="center"
            anchorY="middle"
          >
            {axis.maxValue.toString()}
          </Text>
        </group>
      ))}

      {/* Render labels */}
      {domain.properties.map((label, index) => {
        const isLabelSelected =
          state.scene.selectedPropertyId === label.id &&
          state.scene.selectedPropertyDomainId === domain.id

        return (
          <LabelVisualizationSpider
            key={label.id}
            label={label}
            domain={domain}
            index={index}
            isSelected={isLabelSelected}
            axisData={axisData}
            spiderRadius={SPIDER_RADIUS}
          />
        )
      })}
    </group>
  )
}

export default memo(VisualizationSpider)
