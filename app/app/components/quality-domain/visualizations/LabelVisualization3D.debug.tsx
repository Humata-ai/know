import { useMemo, memo, useEffect, useState, useRef } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { PropertyRegion, QualityDomain } from '../../shared/types'

interface LabelVisualization3DProps {
  label: PropertyRegion
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

function LabelVisualization3DDebug({
  label,
  domain,
  index,
}: LabelVisualization3DProps) {
  const renderCount = useRef(0)
  const [flash, setFlash] = useState(false)

  // Count renders and flash on re-render
  useEffect(() => {
    // Safety check inside useEffect
    if (!label || !label.name) {
      return
    }
    renderCount.current += 1
    console.log(`[LabelViz3D] RENDER #${renderCount.current}`, {
      propertyId: label.id,
      labelName: label.name,
      domainId: domain.id,
      domainName: domain.name,
      timestamp: new Date().toISOString(),
    })

    // Flash red border on re-render
    setFlash(true)
    const timer = setTimeout(() => setFlash(false), 200)
    return () => clearTimeout(timer)
  })

  // Map each domain dimension to label range (or full range if not specified)
  const ranges = useMemo(() => {
    // Safety check inside useMemo
    if (!label || !label.name || !label.dimensions) {
      return [
        { min: 0, max: 0, center: 0, size: 0 },
        { min: 0, max: 0, center: 0, size: 0 },
        { min: 0, max: 0, center: 0, size: 0 }
      ]
    }

    console.log(`[LabelViz3D] Computing ranges for ${label.name}`)
    return domain.dimensions.map((dim) => {
      const labelDim = label.dimensions.find((d) => d.dimensionId === dim.id)
      const labelRange = labelDim?.range || dim.range
      const [dimMin, dimMax] = dim.range

      // Normalize to -4 to +4 space (sizeX/Y/Z = 8)
      const min = -4 + ((labelRange[0] - dimMin) / (dimMax - dimMin)) * 8
      const max = -4 + ((labelRange[1] - dimMin) / (dimMax - dimMin)) * 8

      return { min, max, center: (min + max) / 2, size: max - min }
    })
  }, [label.dimensions, domain.dimensions, label.name])

  // Get color for this label
  const color = LABEL_COLORS[index % LABEL_COLORS.length]
  const flashColor = flash ? '#ff0000' : color

  // Memoize geometry for edges
  const edgesGeometry = useMemo(() => {
    console.log(`[LabelViz3D] Creating edges geometry for ${label.name}`)
    return new THREE.EdgesGeometry(
      new THREE.BoxGeometry(ranges[0].size, ranges[1].size, ranges[2].size)
    )
  }, [ranges[0].size, ranges[1].size, ranges[2].size, label.name])

  // Memoize position arrays to prevent re-renders
  const position = useMemo(
    () => [ranges[0].center, ranges[1].center, ranges[2].center] as const,
    [ranges[0].center, ranges[1].center, ranges[2].center]
  )

  const boxSize = useMemo(
    () => [ranges[0].size, ranges[1].size, ranges[2].size] as const,
    [ranges[0].size, ranges[1].size, ranges[2].size]
  )

  // Safety check before rendering
  if (!label || !label.name) {
    return null
  }

  return (
    <group>
      {/* Transparent box */}
      <mesh position={position}>
        <boxGeometry args={boxSize} />
        <meshStandardMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Edges for clarity - flash red when re-rendering */}
      <lineSegments position={position} geometry={edgesGeometry}>
        <lineBasicMaterial color={flashColor} linewidth={flash ? 4 : 1} />
      </lineSegments>

      {/* Label name with render count */}
      <Text
        position={position}
        fontSize={0.6}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {label.name} (#{renderCount.current})
      </Text>
    </group>
  )
}

// Custom comparison function - only re-render if label ID or dimensions actually changed
const areEqual = (prevProps: LabelVisualization3DProps, nextProps: LabelVisualization3DProps) => {
  const equal =
    prevProps.label.id === nextProps.label.id &&
    prevProps.index === nextProps.index &&
    prevProps.domain.id === nextProps.domain.id &&
    JSON.stringify(prevProps.label.dimensions) === JSON.stringify(nextProps.label.dimensions) &&
    JSON.stringify(prevProps.domain.dimensions) === JSON.stringify(nextProps.domain.dimensions)

  if (!equal) {
    console.log('[LabelViz3D] areEqual = FALSE', {
      propertyIdChanged: prevProps.label.id !== nextProps.label.id,
      indexChanged: prevProps.index !== nextProps.index,
      domainIdChanged: prevProps.domain.id !== nextProps.domain.id,
      labelDimensionsChanged: JSON.stringify(prevProps.label.dimensions) !== JSON.stringify(nextProps.label.dimensions),
      domainDimensionsChanged: JSON.stringify(prevProps.domain.dimensions) !== JSON.stringify(nextProps.domain.dimensions),
    })
  }

  return equal
}

export default memo(LabelVisualization3DDebug, areEqual)
