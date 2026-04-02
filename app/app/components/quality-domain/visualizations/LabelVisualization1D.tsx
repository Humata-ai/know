import { useMemo, memo } from 'react'
import { Text } from '@react-three/drei'
import type { QualityDomainLabel, QualityDomain } from '../../shared/types'
import { isRegion, isPoint } from '../../shared/types'
import { areLabelDimensionsEqual, areDimensionsEqual } from '@/app/utils/equality'

interface LabelVisualization1DProps {
  label: QualityDomainLabel
  domain: QualityDomain
  index: number
}

const LABEL_COLORS = [
  '#10b981', // Emerald green
  '#a855f7', // Purple
  '#3b82f6', // Blue
  '#f59e0b', // Amber/Orange
  '#ec4899', // Pink
  '#06b6d4', // Cyan
]

function LabelVisualization1D({
  label,
  domain,
  index,
}: LabelVisualization1DProps) {
  const dimension = domain.dimensions[0]
  const [dimMin, dimMax] = dimension.range

  const labelDimension = label.dimensions.find(
    (d) => d.dimensionId === dimension.id
  )

  const { centerPos, width, isPointLabel, color } = useMemo(() => {
    if (!labelDimension) {
      return { centerPos: 0, width: 0, isPointLabel: false, color: '#000000' }
    }

    const color = LABEL_COLORS[index % LABEL_COLORS.length]

    if ('value' in labelDimension) {
      const value = labelDimension.value
      const position = -5 + ((value - dimMin) / (dimMax - dimMin)) * 10
      return { centerPos: position, width: 0, isPointLabel: true, color }
    } else {
      const [labelMin, labelMax] = labelDimension.range
      const minPos = -5 + ((labelMin - dimMin) / (dimMax - dimMin)) * 10
      const maxPos = -5 + ((labelMax - dimMin) / (dimMax - dimMin)) * 10
      const centerPos = (minPos + maxPos) / 2
      const width = maxPos - minPos
      return { centerPos, width, isPointLabel: false, color }
    }
  }, [labelDimension, dimMin, dimMax, index, label])

  if (!labelDimension) {
    return null
  }

  const meshPosition = useMemo(() => [centerPos, 0.3, 0] as const, [centerPos])
  const labelPosition = useMemo(() => [centerPos, isPointLabel ? 0.9 : 0.6, 0] as const, [centerPos, isPointLabel])

  return (
    <group>
      {isPointLabel ? (
        <mesh position={meshPosition}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} />
        </mesh>
      ) : (
        <mesh position={meshPosition}>
          <boxGeometry args={[width, 0.3, 0.1]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} />
        </mesh>
      )}

      <Text
        position={labelPosition}
        fontSize={0.5}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {label.name}
      </Text>
    </group>
  )
}

const areEqual = (prevProps: LabelVisualization1DProps, nextProps: LabelVisualization1DProps) => {
  return (
    prevProps.label.id === nextProps.label.id &&
    prevProps.index === nextProps.index &&
    prevProps.domain.id === nextProps.domain.id &&
    areLabelDimensionsEqual(prevProps.label.dimensions, nextProps.label.dimensions) &&
    areDimensionsEqual(prevProps.domain.dimensions, nextProps.domain.dimensions)
  )
}

export default memo(LabelVisualization1D, areEqual)
