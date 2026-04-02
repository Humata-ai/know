/**
 * Label Position Calculation Utilities
 * 
 * Shared utilities for calculating label positions in quality domains.
 * This module centralizes position calculation logic that was previously
 * duplicated across Scene.tsx and ConceptVisualization3D.tsx.
 */

import { Vector3 } from 'three'
import type { QualityDomainLabel, QualityDomain } from '@/app/components/shared/types'
import { isRegion } from '@/app/components/shared/types'
import { normalizeToRange } from './positionCalculations'

/**
 * Get the range for a specific dimension of a label
 * 
 * For regions: returns the dimension's range if found, otherwise falls back to domain range
 * For points: returns the point's value as both min and max [value, value]
 * 
 * @param label - The label to get the range from
 * @param dimensionId - The dimension ID to look up
 * @param defaultRange - Fallback range if dimension not found
 * @returns The range as [min, max]
 */
export function getLabelRange(
  label: QualityDomainLabel,
  dimensionId: string,
  defaultRange: readonly [number, number]
): readonly [number, number] {
  if (isRegion(label)) {
    const labelDim = label.dimensions.find(d => d.dimensionId === dimensionId)
    return labelDim?.range || defaultRange
  } else {
    // For points, use the value as both min and max
    const labelDim = label.dimensions.find(d => d.dimensionId === dimensionId)
    if (labelDim) {
      return [labelDim.value, labelDim.value] as const
    }
    // Fallback to default range
    return defaultRange
  }
}

/**
 * Calculate the world position for a label in a quality domain
 * 
 * Handles 1D, 2D, and 3D labels by calculating their center position
 * within the domain's coordinate space.
 * 
 * @param label - The label to position
 * @param domain - The domain the label belongs to
 * @param domainPos - The domain's position in world space [x, y, z]
 * @param scale - The scale factor for the domain
 * @returns Vector3 position in world space, or null if unable to calculate
 */
export function calculateLabelPosition(
  label: QualityDomainLabel,
  domain: QualityDomain,
  domainPos: readonly [number, number, number],
  scale: number
): Vector3 | null {
  // Skip 4D+ labels (can't visualize in 3D)
  if (domain.dimensions.length >= 4) return null

  const getDimensionRange = (dimId: string): readonly [number, number] => {
    const dim = domain.dimensions.find(d => d.id === dimId)
    return dim ? dim.range : [0, 0]
  }

  if (domain.dimensions.length === 1) {
    // 1D label: positioned on X-axis at Y=0.3, Z=0
    // Maps to -5 to +5 space
    const dim = domain.dimensions[0]
    const labelRange = getLabelRange(label, dim.id, dim.range)
    const minPos = normalizeToRange(labelRange[0], dim.range, [-5, 5])
    const maxPos = normalizeToRange(labelRange[1], dim.range, [-5, 5])
    const centerPos = (minPos + maxPos) / 2

    return new Vector3(
      domainPos[0] + centerPos * scale,
      domainPos[1] + 0.3 * scale,
      domainPos[2]
    )
  } else if (domain.dimensions.length === 2) {
    // 2D label: positioned on XY plane (vertical)
    // Maps to -5 to +5 space
    const dimX = domain.dimensions[0]
    const dimY = domain.dimensions[1]
    const labelRangeX = getLabelRange(label, dimX.id, dimX.range)
    const labelRangeY = getLabelRange(label, dimY.id, dimY.range)

    const minX = normalizeToRange(labelRangeX[0], dimX.range, [-5, 5])
    const maxX = normalizeToRange(labelRangeX[1], dimX.range, [-5, 5])
    const minY = normalizeToRange(labelRangeY[0], dimY.range, [-5, 5])
    const maxY = normalizeToRange(labelRangeY[1], dimY.range, [-5, 5])

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    return new Vector3(
      domainPos[0] + centerX * scale,
      domainPos[1] + centerY * scale,
      domainPos[2]
    )
  } else if (domain.dimensions.length === 3) {
    // 3D label: positioned in 3D space
    // Maps to -4 to +4 space
    const ranges = domain.dimensions.map(dim => {
      const labelRange = getLabelRange(label, dim.id, dim.range)
      const min = normalizeToRange(labelRange[0], dim.range, [-4, 4])
      const max = normalizeToRange(labelRange[1], dim.range, [-4, 4])
      return { center: (min + max) / 2 }
    })

    return new Vector3(
      domainPos[0] + ranges[0].center * scale,
      domainPos[1] + ranges[1].center * scale,
      domainPos[2] + ranges[2].center * scale
    )
  }

  return null
}

/**
 * Calculate positions for multiple labels of a concept
 * 
 * Computes the world position for each label and returns them as an array.
 * Useful for calculating concept centroids.
 * 
 * @param labels - Array of labels to position
 * @param domains - All quality domains
 * @param domainPositions - Map of domain ID to world position
 * @param scale - The scale factor for domains
 * @returns Array of Vector3 positions (excludes labels that can't be positioned)
 */
export function calculateConceptLabelPositions(
  labels: QualityDomainLabel[],
  domains: QualityDomain[],
  domainPositions: Map<string, readonly [number, number, number]>,
  scale: number
): Vector3[] {
  const positions: Vector3[] = []

  labels.forEach(label => {
    const domain = domains.find(d => d.id === label.domainId)
    if (!domain) return

    const domainPos = domainPositions.get(domain.id)
    if (!domainPos) return

    const position = calculateLabelPosition(label, domain, domainPos, scale)
    if (position) {
      positions.push(position)
    }
  })

  return positions
}

/**
 * Calculate the centroid (center point) of multiple positions
 * 
 * @param positions - Array of Vector3 positions
 * @returns The centroid as a Vector3, or null if no positions provided
 */
export function calculateCentroid(positions: Vector3[]): Vector3 | null {
  if (positions.length === 0) return null

  const centroid = new Vector3(0, 0, 0)
  positions.forEach(pos => centroid.add(pos))
  centroid.divideScalar(positions.length)
  
  return centroid
}
