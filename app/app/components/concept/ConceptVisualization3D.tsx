import { useMemo, memo } from 'react'
import { Text, Billboard, Line } from '@react-three/drei'
import { Vector3 } from 'three'
import type { Concept } from '../shared/types'
import type { ThreeEvent } from '@react-three/fiber'
import { useCircularLayoutMap } from '@/app/hooks/useCircularLayout'
import { useCursorOnHover } from '@/app/hooks/useCursorOnHover'
import { normalizeDimensionValue, normalizeToRange } from '@/app/utils/positionCalculations'
import { calculateLabelPosition, calculateConceptLabelPositions, calculateCentroid } from '@/app/utils/labelPositionCalculations'
import { areLabelRefsEqual } from '@/app/utils/equality'
import { VISUALIZATION_SIZE } from '../quality-domain/visualizations/constants'
import { useConceptualSpace } from '../scene/ConceptualSpaceContext'

interface ConceptVisualization3DProps {
  concept: Concept
  isSelected?: boolean
}

/**
 * 3D visualization of a concept and its instances.
 *
 * Renders:
 * - A concept label billboard positioned at the centroid of all label positions
 * - Connection lines from the concept label to each domain label it references
 * - Instance billboards with connection lines to their points
 * - Point markers and inter-point connection lines
 *
 * Data source: reads from ConceptualSpaceContext (not the global store) so that
 * the same component works correctly in both scene and library modes.
 */
function ConceptVisualization3D({ concept, isSelected = false }: ConceptVisualization3DProps) {
  const {
    domains,
    selectedDomainId,
    selectedInstanceId,
    domainScale,
    getConceptLabels,
    getConceptInstances,
    getInstancePoints,
  } = useConceptualSpace()

  const labels = getConceptLabels(concept.id)
  const instances = getConceptInstances(concept.id)

  const cursorHandlers = useCursorOnHover()

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // Note: selection is a scene-only concept; in library mode this is a no-op
    // because selectedConceptId is always null. We could wire this up later if needed.
  }

  // Calculate domain positions using shared hook -- uses the context's domains,
  // not the global store's domains
  const domainPositions = useCircularLayoutMap(domains)

  /**
   * Calculate positions and data for all instances.
   * 
   * For each instance:
   * 1. Calculate world positions for all its points
   * 2. Calculate the centroid of those points
   * 3. Position the instance billboard above the centroid
   * 
   * This ensures instances are positioned near their actual data points
   * rather than overlapping at the world origin.
   */
  const allInstancesData = useMemo(() => {
    return instances.map(instance => {
      const points = getInstancePoints(instance.id)
      const pointPositions: Array<{ 
        pointId: string
        domainName: string
        pointName: string
        position: Vector3 
      }> = []

      // Helper to extract numeric value from point dimension
      const getPointValue = (
        pointDim: typeof points[0]['dimensions'][0] | undefined
      ): number | undefined => {
        if (!pointDim || !('value' in pointDim)) return undefined
        return pointDim.value
      }

      // Calculate world position for each point
      points.forEach((point) => {
        const domain = domains.find((d) => d.id === point.domainId)
        if (!domain) return

        // Skip 4D+ points (can't visualize in 3D)
        if (domain.dimensions.length >= 4) return

        const domainPos = domainPositions.get(domain.id)
        if (!domainPos) return

        const scale = domainScale
        const worldPosition = calculatePointPosition(point, domain, domainPos, scale, getPointValue)
        
        if (worldPosition) {
          pointPositions.push({
            pointId: point.id,
            domainName: domain.name,
            pointName: point.name,
            position: worldPosition
          })
        }
      })

      // Calculate instance billboard position as centroid of points + vertical offset
      const pointOnlyPositions = pointPositions.map(p => p.position)
      let instanceBillboardPosition = calculateCentroid(pointOnlyPositions)
      
      if (instanceBillboardPosition) {
        // Position instance label 6 units above its points' centroid
        instanceBillboardPosition.y += 6
      } else {
        // Fallback: if no points, position at origin (shouldn't happen normally)
        instanceBillboardPosition = new Vector3(0, 10, 0)
      }

      return {
        instance,
        pointPositions,
        instanceBillboardPosition,
        isSelected: selectedInstanceId === instance.id
      }
    }).filter(data => data.pointPositions.length > 0)
  }, [instances, getInstancePoints, domains, selectedInstanceId, domainPositions, domainScale])

  /**
   * Calculate world position for a single point in a domain.
   * Handles 1D, 2D, and 3D domains.
   */
  function calculatePointPosition(
    point: ReturnType<typeof getInstancePoints>[0],
    domain: ReturnType<typeof domains.find>,
    domainPos: readonly [number, number, number],
    scale: number,
    getPointValue: (pointDim: any) => number | undefined
  ): Vector3 | null {
    if (!domain) return null

    if (domain.dimensions.length === 1) {
      // 1D: position on X-axis at Y=0.3, Z=0
      const dim = domain.dimensions[0]
      const pointDim = point.dimensions.find((d) => d.dimensionId === dim.id)
      const value = getPointValue(pointDim)
      if (value === undefined) return null

      const pos = normalizeDimensionValue(value, dim.range, VISUALIZATION_SIZE.SIZE_1D)

      return new Vector3(
        domainPos[0] + pos * scale,
        domainPos[1] + 0.3 * scale,
        domainPos[2]
      )
    } else if (domain.dimensions.length === 2) {
      // 2D: position on XY plane (vertical)
      const dimX = domain.dimensions[0]
      const dimY = domain.dimensions[1]

      const pointDimX = point.dimensions.find((d) => d.dimensionId === dimX.id)
      const pointDimY = point.dimensions.find((d) => d.dimensionId === dimY.id)

      const valueX = getPointValue(pointDimX)
      const valueY = getPointValue(pointDimY)
      if (valueX === undefined || valueY === undefined) return null

      const posX = normalizeDimensionValue(valueX, dimX.range, VISUALIZATION_SIZE.SIZE_2D)
      const posY = normalizeDimensionValue(valueY, dimY.range, VISUALIZATION_SIZE.SIZE_2D)

      return new Vector3(
        domainPos[0] + posX * scale,
        domainPos[1] + posY * scale,
        domainPos[2]
      )
    } else {
      // 3D: position in 3D space
      const values = domain.dimensions.map((dim) => {
        const pointDim = point.dimensions.find((d) => d.dimensionId === dim.id)
        const value = getPointValue(pointDim)
        if (value === undefined) return null

        return normalizeDimensionValue(value, dim.range, 8) // 3D uses size of 8
      })

      if (values.some(v => v === null)) return null

      return new Vector3(
        domainPos[0] + values[0]! * scale,
        domainPos[1] + values[1]! * scale,
        domainPos[2] + values[2]! * scale
      )
    }
  }

  // Calculate label world positions and centroid
  const { labelPositions, conceptPosition } = useMemo(() => {
    const positions: Array<{ labelId: string; position: Vector3 }> = []

    // Calculate positions for each label using shared utility
    labels.forEach((label) => {
      const domain = domains.find((d) => d.id === label.domainId)
      if (!domain) return

      const domainPos = domainPositions.get(domain.id)
      if (!domainPos) return

      // Use the same scale that the domain is rendered at.
      // Previously this used a hardcoded 0.5/0.55 that didn't match the
      // domain rendering scale, causing misalignment.
      const scale = domainScale

      const worldPosition = calculateLabelPosition(label, domain, domainPos, scale)
      if (worldPosition) {
        positions.push({ labelId: label.id, position: worldPosition })
      }
    })

    // Calculate centroid
    const labelOnlyPositions = positions.map(p => p.position)
    let centroid = calculateCentroid(labelOnlyPositions)
    
    if (centroid) {
      // Place concept label 8 units above centroid
      centroid.y += 8
    } else {
      // Default position if no labels (shouldn't happen with validation)
      centroid = new Vector3(0, 10, 0)
    }

    return {
      labelPositions: positions,
      conceptPosition: centroid,
    }
  }, [labels, domains, selectedDomainId, domainPositions, domainScale])

  // If no valid labels to visualize, don't render
  if (labelPositions.length === 0) {
    return null
  }

  // Render both concept and instance visualization
  return (
    <group>
      {/* Concept label billboard */}
      <Billboard
        position={conceptPosition}
        onClick={handleClick}
        {...cursorHandlers}
      >
        {/* Background rectangle */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[concept.name.length * 1.2, 2.2]} />
          <meshBasicMaterial color={isSelected ? '#dbeafe' : '#f3e8ff'} opacity={0.95} transparent />
        </mesh>

        {/* Concept name */}
        <Text
          position={[0, 0, 0]}
          fontSize={1.8}
          color={isSelected ? '#3b82f6' : '#7c3aed'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
          fillOpacity={1}
          fontWeight="bold"
        >
          {concept.name}
        </Text>
      </Billboard>

      {/* Connection lines from concept to each label */}
      {labelPositions.map(({ labelId, position }) => (
        <Line
          key={labelId}
          points={[
            [conceptPosition.x, conceptPosition.y, conceptPosition.z],
            [position.x, position.y, position.z],
          ]}
          color={isSelected ? '#60a5fa' : '#a78bfa'}
          lineWidth={isSelected ? 3 : 2}
          opacity={isSelected ? 0.6 : 0.4}
          transparent
        />
      ))}

      {/* All instances visualization */}
      {allInstancesData.map(({ instance, pointPositions, instanceBillboardPosition, isSelected }) => (
        <group key={instance.id}>
          {/* Instance name billboard - positioned above centroid of its points */}
          <Billboard
            position={instanceBillboardPosition}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation()
              // Selection is scene-only; no-op in library mode
            }}
            {...cursorHandlers}
          >
            {/* Background rectangle */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[instance.name.length * 1.2, 2.2]} />
              <meshBasicMaterial
                color={isSelected ? "#dbeafe" : "#eff6ff"}
                opacity={isSelected ? 0.95 : 0.85}
                transparent
              />
            </mesh>

            {/* Instance name */}
            <Text
              position={[0, 0, 0]}
              fontSize={1.8}
              color={isSelected ? "#3b82f6" : "#60a5fa"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.1}
              outlineColor="#000000"
              fillOpacity={1}
              fontWeight={isSelected ? "bold" : "normal"}
            >
              {instance.name}
            </Text>
          </Billboard>

          {/* Connection lines from instance billboard to each point */}
          {pointPositions.map(({ pointId, position }) => (
            <Line
              key={`instance-${instance.id}-${pointId}`}
              points={[
                [instanceBillboardPosition.x, instanceBillboardPosition.y, instanceBillboardPosition.z],
                [position.x, position.y, position.z],
              ]}
              color={isSelected ? '#3b82f6' : '#60a5fa'}
              lineWidth={isSelected ? 2 : 1.5}
              opacity={isSelected ? 0.5 : 0.3}
              transparent
            />
          ))}

          {/* Point markers - spheres showing where instance points exist in domain space */}
          {pointPositions.map(({ pointId, domainName, pointName, position }) => (
            <group key={pointId}>
              {/* Point sphere */}
              <mesh position={position}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  opacity={isSelected ? 1.0 : 0.7}
                  transparent={!isSelected}
                />
              </mesh>

              {/* Point label */}
              <Billboard position={[position.x, position.y + 1, position.z]}>
                <Text
                  fontSize={0.6}
                  color="#2563eb"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.05}
                  outlineColor="#000000"
                  fillOpacity={isSelected ? 1.0 : 0.7}
                >
                  {pointName}
                </Text>
              </Billboard>
            </group>
          ))}

          {/* Connection lines between points of the same instance */}
          {pointPositions.map(({ pointId: pointId1, position: pos1 }, i) =>
            pointPositions.slice(i + 1).map(({ pointId: pointId2, position: pos2 }) => (
              <Line
                key={`${pointId1}-${pointId2}`}
                points={[
                  [pos1.x, pos1.y, pos1.z],
                  [pos2.x, pos2.y, pos2.z],
                ]}
                color="#3b82f6"
                lineWidth={isSelected ? 2 : 1.5}
                opacity={isSelected ? 0.5 : 0.3}
                transparent
              />
            ))
          )}
        </group>
      ))}
    </group>
  )
}

// Custom comparison to prevent unnecessary re-renders
const areEqual = (prevProps: ConceptVisualization3DProps, nextProps: ConceptVisualization3DProps) => {
  return (
    prevProps.concept.id === nextProps.concept.id &&
    prevProps.concept.name === nextProps.concept.name &&
    areLabelRefsEqual(prevProps.concept.labelRefs, nextProps.concept.labelRefs)
  )
}

export default memo(ConceptVisualization3D, areEqual)
