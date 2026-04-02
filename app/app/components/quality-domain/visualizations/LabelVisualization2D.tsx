import { useMemo, memo } from 'react'
import { Text } from '@react-three/drei'
import type { QualityDomainLabel, QualityDomain } from '../../shared/types'
import { isRegion, isPoint } from '../../shared/types'
import { useQualityDomain } from '@/app/store'
import type { ThreeEvent } from '@react-three/fiber'
import { useCursorOnHover } from '@/app/hooks/useCursorOnHover'
import { areLabelDimensionsEqual, areDimensionsEqual } from '@/app/utils/equality'

interface LabelVisualization2DProps {
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

function LabelVisualization2D({
  label,
  domain,
  index,
  isSelected = false,
}: LabelVisualization2DProps) {
  const { selectLabel } = useQualityDomain()
  const cursorHandlers = useCursorOnHover()

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectLabel(domain.id, label.id)
  }

  const dimX = domain.dimensions[0]
  const dimY = domain.dimensions[1]
  const [dimMinX, dimMaxX] = dimX.range
  const [dimMinY, dimMaxY] = dimY.range

  const labelDimX = label.dimensions.find((d) => d.dimensionId === dimX.id)
  const labelDimY = label.dimensions.find((d) => d.dimensionId === dimY.id)

  const { centerX, centerY, sizeX, sizeY, isPointLabel, color } = useMemo(() => {
    const baseColor = isSelected ? '#3b82f6' : LABEL_COLORS[index % LABEL_COLORS.length]

    // Check if dimensions are point-type by looking for 'value' property
    const isPointX = labelDimX && 'value' in labelDimX
    const isPointY = labelDimY && 'value' in labelDimY

    if (isPointX && isPointY) {
      const valueX = labelDimX.value
      const valueY = labelDimY.value

      const posX = -5 + ((valueX - dimMinX) / (dimMaxX - dimMinX)) * 10
      const posY = -5 + ((valueY - dimMinY) / (dimMaxY - dimMinY)) * 10

      return { centerX: posX, centerY: posY, sizeX: 0, sizeY: 0, isPointLabel: true, color: baseColor }
    } else {
      const labelRangeX = (labelDimX && 'range' in labelDimX) ? labelDimX.range : dimX.range
      const labelRangeY = (labelDimY && 'range' in labelDimY) ? labelDimY.range : dimY.range

      const minX = -5 + ((labelRangeX[0] - dimMinX) / (dimMaxX - dimMinX)) * 10
      const maxX = -5 + ((labelRangeX[1] - dimMinX) / (dimMaxX - dimMinX)) * 10
      const minY = -5 + ((labelRangeY[0] - dimMinY) / (dimMaxY - dimMinY)) * 10
      const maxY = -5 + ((labelRangeY[1] - dimMinY) / (dimMaxY - dimMinY)) * 10

      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      const sizeX = maxX - minX
      const sizeY = maxY - minY

      return { centerX, centerY, sizeX, sizeY, isPointLabel: false, color: baseColor }
    }
  }, [
    labelDimX,
    labelDimY,
    dimX.range,
    dimY.range,
    dimMinX,
    dimMaxX,
    dimMinY,
    dimMaxY,
    index,
    isSelected,
    label,
  ])

  const meshPosition = useMemo(() => [centerX, centerY, 0.1] as const, [centerX, centerY])
  const labelPosition = useMemo(() => [centerX, centerY, isPointLabel ? 0.5 : 0.3] as const, [centerX, centerY, isPointLabel])
  const rotation = useMemo(() => [0, 0, 0] as const, [])

  return (
    <group
      rotation={rotation}
      onClick={handleClick}
      {...cursorHandlers}
    >
      {isPointLabel ? (
        <mesh position={meshPosition}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ) : (
        <mesh position={meshPosition}>
          <boxGeometry args={[sizeX, sizeY, 0.1]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}

      <Text
        position={labelPosition}
        fontSize={0.6}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {label.name}
      </Text>
    </group>
  )
}

const areEqual = (prevProps: LabelVisualization2DProps, nextProps: LabelVisualization2DProps) => {
  return (
    prevProps.label.id === nextProps.label.id &&
    prevProps.index === nextProps.index &&
    prevProps.domain.id === nextProps.domain.id &&
    prevProps.isSelected === nextProps.isSelected &&
    areLabelDimensionsEqual(prevProps.label.dimensions, nextProps.label.dimensions) &&
    areDimensionsEqual(prevProps.domain.dimensions, nextProps.domain.dimensions)
  )
}

export default memo(LabelVisualization2D, areEqual)
