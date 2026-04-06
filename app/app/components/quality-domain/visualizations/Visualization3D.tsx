import { useMemo, memo, type ReactElement } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { QualityDomain } from '../../shared/types'
import LabelVisualization3D from './LabelVisualization3D'
import { useQualityDomain } from '@/app/store'
import type { ThreeEvent } from '@react-three/fiber'
import { useCursorOnHover } from '@/app/hooks/useCursorOnHover'
import { VISUALIZATION_SIZE, GRID } from './constants'

interface Visualization3DProps {
  domain: QualityDomain
}

function Visualization3D({ domain }: Visualization3DProps) {
  const { selectDomain, state } = useQualityDomain()
  const cursorHandlers = useCursorOnHover()

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectDomain(domain.id)
  }

  const dimX = domain.dimensions[0]
  const dimY = domain.dimensions[1]
  const dimZ = domain.dimensions[2]
  const [minX, maxX] = dimX.range
  const [minY, maxY] = dimY.range
  const [minZ, maxZ] = dimZ.range

  const sizeX = VISUALIZATION_SIZE.SIZE_3D
  const sizeY = VISUALIZATION_SIZE.SIZE_3D
  const sizeZ = VISUALIZATION_SIZE.SIZE_3D
  const gridDivisions = GRID.DIVISIONS_3D

  // Create grid lines on all three faces
  const gridLines = useMemo(() => {
    const lines: ReactElement[] = []
    const step = sizeX / gridDivisions

    // XY plane (front face)
    for (let i = 0; i <= gridDivisions; i++) {
      const offset = -sizeX / 2 + i * step
      // Vertical lines
      lines.push(
        <mesh key={`xy-v-${i}`} position={[offset, 0, -sizeZ / 2]}>
          <boxGeometry args={[0.02, sizeY, 0.02]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )
      // Horizontal lines
      lines.push(
        <mesh key={`xy-h-${i}`} position={[0, offset, -sizeZ / 2]}>
          <boxGeometry args={[sizeX, 0.02, 0.02]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )
    }

    // XZ plane (bottom face)
    for (let i = 0; i <= gridDivisions; i++) {
      const offset = -sizeX / 2 + i * step
      // Lines along X
      lines.push(
        <mesh key={`xz-x-${i}`} position={[offset, -sizeY / 2, 0]}>
          <boxGeometry args={[0.02, 0.02, sizeZ]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )
      // Lines along Z
      lines.push(
        <mesh key={`xz-z-${i}`} position={[0, -sizeY / 2, offset]}>
          <boxGeometry args={[sizeX, 0.02, 0.02]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )
    }

    // YZ plane (left face)
    for (let i = 0; i <= gridDivisions; i++) {
      const offset = -sizeY / 2 + i * step
      // Lines along Y
      lines.push(
        <mesh key={`yz-y-${i}`} position={[-sizeX / 2, offset, 0]}>
          <boxGeometry args={[0.02, 0.02, sizeZ]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )
      // Lines along Z
      lines.push(
        <mesh key={`yz-z-${i}`} position={[-sizeX / 2, 0, offset]}>
          <boxGeometry args={[0.02, sizeY, 0.02]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )
    }

    return lines
  }, [sizeX, sizeY, sizeZ, gridDivisions])

  return (
    <group
      onClick={handleClick}
      {...cursorHandlers}
    >
      {/* Transparent box */}
      <mesh>
        <boxGeometry args={[sizeX, sizeY, sizeZ]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Box edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(sizeX, sizeY, sizeZ)]} />
        <lineBasicMaterial color="#3b82f6" linewidth={2} />
      </lineSegments>

      {/* Grid lines */}
      {gridLines}

      {/* X-axis (Red) */}
      <mesh position={[0, -sizeY / 2 - 0.5, -sizeZ / 2 - 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, sizeX * 1.2]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Text
        position={[0, -sizeY / 2 - 1.5, -sizeZ / 2 - 1]}
        fontSize={0.4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {dimX.name}
      </Text>
      <Text
        position={[-sizeX / 2, -sizeY / 2 - 1, -sizeZ / 2 - 1]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {minX.toString()}
      </Text>
      <Text
        position={[sizeX / 2, -sizeY / 2 - 1, -sizeZ / 2 - 1]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {maxX.toString()}
      </Text>

      {/* Y-axis (Green) */}
      <mesh position={[-sizeX / 2 - 0.5, 0, -sizeZ / 2 - 0.5]}>
        <cylinderGeometry args={[0.05, 0.05, sizeY * 1.2]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <Text
        position={[-sizeX / 2 - 1, 0, -sizeZ / 2 - 1.5]}
        fontSize={0.4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
      >
        {dimY.name}
      </Text>
      <Text
        position={[-sizeX / 2 - 1, -sizeY / 2, -sizeZ / 2 - 1]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {minY.toString()}
      </Text>
      <Text
        position={[-sizeX / 2 - 1, sizeY / 2, -sizeZ / 2 - 1]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {maxY.toString()}
      </Text>

      {/* Z-axis (Blue) */}
      <mesh position={[-sizeX / 2 - 0.5, -sizeY / 2 - 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, sizeZ * 1.2]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <Text
        position={[-sizeX / 2 - 1.5, -sizeY / 2 - 1, 0]}
        fontSize={0.4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        {dimZ.name}
      </Text>
      <Text
        position={[-sizeX / 2 - 1, -sizeY / 2 - 1, -sizeZ / 2]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {minZ.toString()}
      </Text>
      <Text
        position={[-sizeX / 2 - 1, -sizeY / 2 - 1, sizeZ / 2]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {maxZ.toString()}
      </Text>

      {/* Render labels */}
      {domain.labels.map((label, index) => {
        const isLabelSelected =
          state.scene.selectedLabelId === label.id &&
          state.scene.selectedLabelDomainId === domain.id

        return (
          <LabelVisualization3D
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

export default memo(Visualization3D)
