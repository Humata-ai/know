import { Text } from '@react-three/drei'
import type { QualityDomain } from '../../shared/types'
import LabelVisualization1D from './LabelVisualization1D'

interface Visualization1DProps {
  domain: QualityDomain
}

export default function Visualization1D({ domain }: Visualization1DProps) {
  const dimension = domain.dimensions[0]
  const [min, max] = dimension.range
  const length = 10 // Visual length of the line

  return (
    <group>
      {/* Main line */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[length, 0.1, 0.1]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Start tick mark */}
      <mesh position={[-length / 2, 0, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* End tick mark */}
      <mesh position={[length / 2, 0, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* Dimension name label (above center) */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.5}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {dimension.name}
      </Text>

      {/* Min value label */}
      <Text
        position={[-length / 2, -0.8, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {min.toString()}
      </Text>

      {/* Max value label */}
      <Text
        position={[length / 2, -0.8, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {max.toString()}
      </Text>

      {/* Render labels */}
      {domain.properties.map((label, index) => (
        <LabelVisualization1D
          key={label.id}
          label={label}
          domain={domain}
          index={index}
        />
      ))}
    </group>
  )
}
