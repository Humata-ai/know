import { useMemo, type ReactElement } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { QualityDomain } from '../../shared/types'
import LabelVisualization2D from './LabelVisualization2D'
import { useQualityDomain } from '@/app/store'
import type { ThreeEvent } from '@react-three/fiber'
import { useCursorOnHover } from '@/app/hooks/useCursorOnHover'
import { VISUALIZATION_SIZE, GRID } from './constants'

interface Visualization2DProps {
  domain: QualityDomain
}

export default function Visualization2D({ domain }: Visualization2DProps) {
  const { selectDomain, state } = useQualityDomain()
  const cursorHandlers = useCursorOnHover()

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectDomain(domain.id)
  }

  const dimX = domain.dimensions[0]
  const dimY = domain.dimensions[1]
  const [minX, maxX] = dimX.range
  const [minY, maxY] = dimY.range

  const sizeX = VISUALIZATION_SIZE.SIZE_2D
  const sizeY = VISUALIZATION_SIZE.SIZE_2D
  const gridDivisions = GRID.DIVISIONS_2D

  // Create grid lines
  const gridLines = useMemo(() => {
    const lines: ReactElement[] = []
    const stepX = sizeX / gridDivisions
    const stepY = sizeY / gridDivisions

    // Vertical lines (along Y axis)
    for (let i = 0; i <= gridDivisions; i++) {
      const x = -sizeX / 2 + i * stepX
      lines.push(
        <mesh key={`v-${i}`} position={[x, 0, 0]}>
          <boxGeometry args={[0.02, sizeY, 0.02]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )
    }

    // Horizontal lines (along X axis)
    for (let i = 0; i <= gridDivisions; i++) {
      const y = -sizeY / 2 + i * stepY
      lines.push(
        <mesh key={`h-${i}`} position={[0, y, 0]}>
          <boxGeometry args={[sizeX, 0.02, 0.02]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )
    }

    return lines
  }, [sizeX, sizeY, gridDivisions])

  return (
    <group
      onClick={handleClick}
      {...cursorHandlers}
    >
      {/* Grid plane (transparent) */}
      <mesh>
        <planeGeometry args={[sizeX, sizeY]} />
        <meshStandardMaterial color="#f3f4f6" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Grid lines */}
      <group>{gridLines}</group>

      {/* Boundary rectangle */}
      <group>
        <lineSegments>
          <edgesGeometry
            args={[new THREE.PlaneGeometry(sizeX, sizeY)]}
          />
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </lineSegments>
      </group>

      {/* X-axis label */}
      <Text
        position={[0, -sizeY / 2 - 1, 0]}
        fontSize={0.4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {dimX.name}
      </Text>

      {/* X-axis min/max labels */}
      <Text
        position={[-sizeX / 2, -sizeY / 2 - 0.5, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {minX.toString()}
      </Text>
      <Text
        position={[sizeX / 2, -sizeY / 2 - 0.5, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {maxX.toString()}
      </Text>

      {/* Y-axis label */}
      <Text
        position={[-sizeX / 2 - 1, 0, 0]}
        fontSize={0.4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
      >
        {dimY.name}
      </Text>

      {/* Y-axis min/max labels */}
      <Text
        position={[-sizeX / 2 - 0.5, -sizeY / 2, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {minY.toString()}
      </Text>
      <Text
        position={[-sizeX / 2 - 0.5, sizeY / 2, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {maxY.toString()}
      </Text>

      {/* Render labels */}
      {domain.properties.map((label, index) => {
        const isLabelSelected =
          state.scene.selectedPropertyId === label.id &&
          state.scene.selectedPropertyDomainId === domain.id

        return (
          <LabelVisualization2D
            key={label.id}
            label={label}
            domain={domain}
            index={index}
            isSelected={isLabelSelected}
          />
        )
      })}
    </group>
  )
}
