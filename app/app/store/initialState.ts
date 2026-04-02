import type { AppState } from './types'
import type { QualityDomain, Concept, ConceptInstance, QualityDomainLabel, ConceptualStructure, RegionDimensionRange, PointDimensionValue } from '../components/shared/types'
import defaultDataJson from '../components/shared/defaultData.json'

/**
 * JSON-compatible types for loading from file
 * 
 * These types match the structure of the JSON data file and are converted
 * to the proper runtime types during loading.
 */
interface JsonDimension {
  id: string
  name: string
  range: number[]
  type?: string
}

interface JsonRegionDimensionRange {
  dimensionId: string
  range: number[]
}

interface JsonPointDimensionValue {
  dimensionId: string
  value: number
}

interface JsonLabel {
  type: 'region' | 'point'
  id: string
  name: string
  domainId: string
  dimensions: (JsonRegionDimensionRange | JsonPointDimensionValue)[]
  createdAt: string
}

interface JsonDomain {
  id: string
  name: string
  dimensions: JsonDimension[]
  labels: JsonLabel[]
  createdAt: string
}

interface JsonConcept {
  id: string
  name: string
  labelRefs: { domainId: string; labelId: string }[]
  createdAt: string
}

interface JsonInstance {
  id: string
  conceptId: string
  name: string
  pointRefs: { domainId: string; pointId: string }[]
  createdAt: string
}

interface JsonConceptualStructure {
  domains: JsonDomain[]
  concepts: JsonConcept[]
  instances: JsonInstance[]
}

interface JsonWord {
  id: string
  name: string
  wordClass: string
  conceptualStructure: JsonConceptualStructure
  createdAt: string
}

interface JsonState {
  domains: JsonDomain[]
  concepts: JsonConcept[]
  instances: JsonInstance[]
  words: JsonWord[]
}

/**
 * Helper to convert JSON array to readonly tuple
 */
function toRangeTuple(arr: number[]): readonly [number, number] {
  if (arr.length !== 2) {
    throw new Error(`Range must have exactly 2 elements, got ${arr.length}`)
  }
  return [arr[0], arr[1]] as const
}

/**
 * Helper to handle Infinity string values from JSON
 */
function parseRangeValue(val: number | string): number {
  if (val === "Infinity") return Infinity
  if (val === "-Infinity") return -Infinity
  return val as number
}

/**
 * Parse JSON domains into runtime QualityDomain objects
 */
function parseDomains(jsonDomains: JsonDomain[]): QualityDomain[] {
  return jsonDomains.map(domain => ({
    ...domain,
    dimensions: domain.dimensions.map(dim => ({
      ...dim,
      range: toRangeTuple(dim.range.map(parseRangeValue)),
    })),
    labels: domain.labels.map(label => {
      if (label.type === 'region') {
        return {
          type: 'region' as const,
          id: label.id,
          name: label.name,
          domainId: label.domainId,
          dimensions: label.dimensions.map(d => {
            if ('range' in d) {
              return {
                dimensionId: d.dimensionId,
                range: toRangeTuple((d.range as (number | string)[]).map(parseRangeValue)),
              }
            }
            return d as unknown as RegionDimensionRange
          }),
          createdAt: new Date(label.createdAt),
        }
      } else {
        return {
          type: 'point' as const,
          id: label.id,
          name: label.name,
          domainId: label.domainId,
          dimensions: label.dimensions as PointDimensionValue[],
          createdAt: new Date(label.createdAt),
        }
      }
    }),
    createdAt: new Date(domain.createdAt),
  }))
}

/**
 * Parse JSON concepts into runtime Concept objects
 */
function parseConcepts(jsonConcepts: JsonConcept[]): Concept[] {
  return jsonConcepts.map(concept => ({
    ...concept,
    labelRefs: concept.labelRefs,
    createdAt: new Date(concept.createdAt),
  }))
}

/**
 * Parse JSON instances into runtime ConceptInstance objects
 */
function parseInstances(jsonInstances: JsonInstance[]): ConceptInstance[] {
  return (jsonInstances || []).map(instance => ({
    ...instance,
    pointRefs: instance.pointRefs,
    createdAt: new Date(instance.createdAt),
  }))
}

/**
 * Parse a JSON conceptual structure into a runtime ConceptualStructure
 */
function parseConceptualStructure(json: JsonConceptualStructure): ConceptualStructure {
  return {
    domains: parseDomains(json.domains || []),
    concepts: parseConcepts(json.concepts || []),
    instances: parseInstances(json.instances || []),
  }
}

/**
 * Load and convert default data from JSON file
 */
const jsonData: JsonState = defaultDataJson as unknown as JsonState

/**
 * Initial application state
 * 
 * Loads default data from JSON and converts it to the proper runtime types.
 */
export const initialState: AppState = {
  scene: {
    domains: parseDomains(jsonData.domains),
    selectedDomainId: null,
    selectedLabelId: null,
    selectedLabelDomainId: null,
    selectedConceptId: null,
    selectedInstanceId: null,
    concepts: parseConcepts(jsonData.concepts),
    instances: parseInstances(jsonData.instances || []),
    hasRestoredState: false,
  },
  library: {
    dictionaryWords: [],
    concepts: [],
    domains: parseDomains(jsonData.domains),
    actions: [],
    selectedItemId: null,
    selectedItemType: null,
  },
}
