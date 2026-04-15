/**
 * JSON Type Definitions
 * 
 * These types represent the structure of data as it appears in JSON format,
 * before type conversion (e.g., before Date parsing, Infinity conversion).
 * 
 * Use these types instead of 'any' when parsing JSON data to improve type safety.
 */

/**
 * JSON representation of a dimension range
 * Infinity values are serialized as strings "Infinity" or "-Infinity"
 */
export interface JsonDimensionRange {
  readonly 0: number | 'Infinity' | '-Infinity'
  readonly 1: number | 'Infinity' | '-Infinity'
}

/**
 * JSON representation of a quality dimension
 */
export interface JsonQualityDimension {
  id: string
  name: string
  range: JsonDimensionRange | [number | string, number | string]
}

/**
 * JSON representation of a region dimension (has range)
 */
export interface JsonRegionDimension {
  dimensionId: string
  range: JsonDimensionRange | [number | string, number | string]
}

/**
 * JSON representation of a point dimension (has value)
 */
export interface JsonPointDimension {
  dimensionId: string
  value: number
}

/**
 * JSON representation of a property dimension (union of region and point)
 */
export type JsonPropertyDimension = JsonRegionDimension | JsonPointDimension

/**
 * JSON representation of a quality domain property
 */
export interface JsonQualityDomainProperty {
  id: string
  name: string
  domainId: string
  type: 'region' | 'point'
  dimensions: JsonPropertyDimension[]
  createdAt: string // ISO date string
}

/**
 * JSON representation of a quality domain
 */
export interface JsonQualityDomain {
  id: string
  name: string
  dimensions: JsonQualityDimension[]
  properties?: JsonQualityDomainProperty[]
  labels?: any[] // Old format for backward compatibility migration
  createdAt: string // ISO date string
}

/**
 * JSON representation of a property reference
 */
export interface JsonPropertyReference {
  domainId: string
  propertyId: string
}

/**
 * JSON representation of a concept
 */
export interface JsonConcept {
  id: string
  name: string
  propertyRefs?: JsonPropertyReference[]
  propertyRefs?: any[] // Old format for backward compatibility migration
  createdAt: string // ISO date string
}

/**
 * JSON representation of a point reference
 */
export interface JsonPointReference {
  domainId: string
  pointId: string
}

/**
 * JSON representation of a concept instance
 */
export interface JsonConceptInstance {
  id: string
  name: string
  conceptId: string
  pointRefs: JsonPointReference[]
  createdAt: string // ISO date string
}

/**
 * JSON representation of a conceptual structure
 */
export interface JsonConceptualStructure {
  domains: JsonQualityDomain[]
  concepts: JsonConcept[]
  instances: JsonConceptInstance[]
}

/**
 * JSON representation of a dictionary word
 */
export interface JsonDictionaryWord {
  id: string
  name: string
  propertyRef?: JsonPropertyReference
  propertyRef?: any // Old format for backward compatibility migration
  conceptId?: string
  createdAt: string // ISO date string
}

/**
 * Type guard to check if a value is a valid JSON dimension range
 */
export function isJsonDimensionRange(value: unknown): value is [number | string, number | string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    (typeof value[0] === 'number' || typeof value[0] === 'string') &&
    (typeof value[1] === 'number' || typeof value[1] === 'string')
  )
}

/**
 * Type guard to check if a property dimension is a region (has range)
 */
export function isJsonRegionDimension(dim: unknown): dim is JsonRegionDimension {
  return (
    typeof dim === 'object' &&
    dim !== null &&
    'range' in dim &&
    'dimensionId' in dim
  )
}

/**
 * Type guard to check if a property dimension is a point (has value)
 */
export function isJsonPointDimension(dim: unknown): dim is JsonPointDimension {
  return (
    typeof dim === 'object' &&
    dim !== null &&
    'value' in dim &&
    'dimensionId' in dim
  )
}
