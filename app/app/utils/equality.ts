/**
 * Equality Comparison Utilities
 * 
 * Optimized comparison functions for React memoization.
 * Replaces expensive JSON.stringify() comparisons with targeted equality checks.
 */

import type { QualityDimension, Property, PropertyReference } from '@/app/components/shared/types'

/**
 * Compare two quality dimensions for equality
 * Checks id, name, and range values
 */
export function areDimensionsEqual(
  a: readonly QualityDimension[] | QualityDimension[],
  b: readonly QualityDimension[] | QualityDimension[]
): boolean {
  if (a.length !== b.length) return false
  
  return a.every((dimA, index) => {
    const dimB = b[index]
    return (
      dimA.id === dimB.id &&
      dimA.name === dimB.name &&
      dimA.range[0] === dimB.range[0] &&
      dimA.range[1] === dimB.range[1]
    )
  })
}

/**
 * Compare two label dimension arrays for equality
 * Handles both region dimensions (with range) and point dimensions (with value)
 */
export function areLabelDimensionsEqual(
  a: Property['dimensions'],
  b: Property['dimensions']
): boolean {
  if (a.length !== b.length) return false
  
  return a.every((dimA, index) => {
    const dimB = b[index]
    
    // Check dimensionId
    if (dimA.dimensionId !== dimB.dimensionId) return false
    
    // Check if both are regions (have range) or both are points (have value)
    const aIsRegion = 'range' in dimA
    const bIsRegion = 'range' in dimB
    
    if (aIsRegion !== bIsRegion) return false
    
    if (aIsRegion && bIsRegion) {
      // Both are regions - compare ranges
      const dimAWithRange = dimA as { dimensionId: string; range: readonly [number, number] }
      const dimBWithRange = dimB as { dimensionId: string; range: readonly [number, number] }
      return (
        dimAWithRange.range[0] === dimBWithRange.range[0] &&
        dimAWithRange.range[1] === dimBWithRange.range[1]
      )
    } else {
      // Both are points - compare values
      const dimAWithValue = dimA as { dimensionId: string; value: number }
      const dimBWithValue = dimB as { dimensionId: string; value: number }
      return dimAWithValue.value === dimBWithValue.value
    }
  })
}

/**
 * Compare two label arrays for equality
 * Checks id, name, type, domainId, and dimensions
 */
export function areLabelsEqual(
  a: readonly Property[] | Property[],
  b: readonly Property[] | Property[]
): boolean {
  if (a.length !== b.length) return false
  
  return a.every((labelA, index) => {
    const labelB = b[index]
    return (
      labelA.id === labelB.id &&
      labelA.name === labelB.name &&
      labelA.type === labelB.type &&
      labelA.domainId === labelB.domainId &&
      areLabelDimensionsEqual(labelA.dimensions, labelB.dimensions)
    )
  })
}

/**
 * Compare two label reference arrays for equality
 * Checks domainId and propertyId
 */
export function areLabelRefsEqual(
  a: readonly PropertyReference[] | PropertyReference[],
  b: readonly PropertyReference[] | PropertyReference[]
): boolean {
  if (a.length !== b.length) return false
  
  return a.every((refA, index) => {
    const refB = b[index]
    return (
      refA.domainId === refB.domainId &&
      refA.propertyId === refB.propertyId
    )
  })
}

/**
 * Shallow comparison of primitive values and object references
 * Useful for comparing non-nested props
 */
export function shallowEqual(objA: any, objB: any): boolean {
  if (Object.is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i]
    if (
      !Object.prototype.hasOwnProperty.call(objB, currentKey) ||
      !Object.is(objA[currentKey], objB[currentKey])
    ) {
      return false
    }
  }

  return true
}
