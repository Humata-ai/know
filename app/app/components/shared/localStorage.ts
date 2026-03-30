import type { QualityDomain, Concept, ConceptInstance, ConceptualStructure, QualityDomainLabel, Property, PropertyReference, LabelReference, Word } from './types'
import type { AppState } from '@/app/store'

const STORAGE_KEY = 'quality-domain-state'
const STATE_VERSION = 5 // Version 5 adds library quality domains as independent state

// Migration: Convert old Property to QualityDomainLabel (Region)
function migratePropertyToLabel(oldProperty: Property): QualityDomainLabel {
  return {
    type: 'region',
    id: oldProperty.id,
    name: oldProperty.name,
    domainId: oldProperty.domainId,
    dimensions: oldProperty.dimensions,
    createdAt: oldProperty.createdAt
  }
}

// Migration: Convert old PropertyReference to LabelReference
function migratePropertyRefToLabelRef(oldRef: PropertyReference): LabelReference {
  return {
    domainId: oldRef.domainId,
    labelId: oldRef.propertyId
  }
}

// Same logic as StateDebugPanel export
export function serializeState(state: AppState): string {
  const stateWithVersion = {
    scene: state.scene,
    library: state.library,
    version: STATE_VERSION
  }

  const persistableState = JSON.stringify(stateWithVersion, (key, value) => {
    // Filter out selection state and transient flags
    if (key === 'selectedDomainId' ||
        key === 'selectedLabelId' ||
        key === 'selectedLabelDomainId' ||
        key === 'selectedConceptId' ||
        key === 'selectedInstanceId' ||
        key === 'selectedWordId' ||
        key === 'hasRestoredState') {
      return undefined
    }

    // Handle Infinity values
    if (value === Infinity) return "Infinity"
    if (value === -Infinity) return "-Infinity"

    return value
  })

  return persistableState
}

/**
 * Parse domains from raw JSON data, handling migrations from older formats.
 */
function parseDomains(rawDomains: any[], version: number): QualityDomain[] {
  return rawDomains.map((domain: any) => {
    const baseDomain = {
      ...domain,
      createdAt: new Date(domain.createdAt),
      dimensions: domain.dimensions.map((dim: any) => ({
        ...dim,
        range: [
          dim.range[0] === "Infinity" ? Infinity : dim.range[0] === "-Infinity" ? -Infinity : dim.range[0],
          dim.range[1] === "Infinity" ? Infinity : dim.range[1] === "-Infinity" ? -Infinity : dim.range[1]
        ] as const
      }))
    }

    // Handle old format (version 1) with properties field
    if (version === 1 || domain.properties) {
      const oldProperties = (domain.properties || []).map((prop: any) => ({
        ...prop,
        createdAt: new Date(prop.createdAt),
        dimensions: prop.dimensions.map((d: any) => ({
          ...d,
          range: [
            d.range[0] === "Infinity" ? Infinity : d.range[0] === "-Infinity" ? -Infinity : d.range[0],
            d.range[1] === "Infinity" ? Infinity : d.range[1] === "-Infinity" ? -Infinity : d.range[1]
          ] as const
        }))
      }))

      // Migrate old properties to labels
      return {
        ...baseDomain,
        labels: oldProperties.map(migratePropertyToLabel)
      }
    }

    // Handle new format (version 2+) with labels field
    const labels = (domain.labels || []).map((label: any) => ({
      ...label,
      createdAt: new Date(label.createdAt),
      dimensions: label.dimensions.map((d: any) => {
        // Handle region dimensions (with range)
        if ('range' in d) {
          return {
            ...d,
            range: [
              d.range[0] === "Infinity" ? Infinity : d.range[0] === "-Infinity" ? -Infinity : d.range[0],
              d.range[1] === "Infinity" ? Infinity : d.range[1] === "-Infinity" ? -Infinity : d.range[1]
            ] as const
          }
        }
        // Handle point dimensions (with value)
        return d
      })
    }))

    return {
      ...baseDomain,
      labels
    }
  })
}

/**
 * Parse concepts from raw JSON data, handling migrations from older formats.
 */
function parseConcepts(rawConcepts: any[], version: number): Concept[] {
  return (rawConcepts || []).map((concept: any) => {
    const baseConcept = {
      ...concept,
      createdAt: new Date(concept.createdAt)
    }

    // Handle old format with propertyRefs
    if (version === 1 || concept.propertyRefs) {
      return {
        ...baseConcept,
        labelRefs: (concept.propertyRefs || []).map(migratePropertyRefToLabelRef)
      }
    }

    // New format already has labelRefs
    return baseConcept
  })
}

/**
 * Parse instances from raw JSON data.
 */
function parseInstances(rawInstances: any[]): ConceptInstance[] {
  return (rawInstances || []).map((instance: any) => ({
    ...instance,
    createdAt: new Date(instance.createdAt)
  }))
}

/**
 * Parse a conceptual structure from raw JSON data.
 */
function parseConceptualStructure(raw: any): ConceptualStructure {
  if (!raw) {
    return { domains: [], concepts: [], instances: [] }
  }
  return {
    domains: parseDomains(raw.domains || [], 4),
    concepts: parseConcepts(raw.concepts || [], 4),
    instances: parseInstances(raw.instances || []),
  }
}

/**
 * Parse words from raw JSON data.
 */
function parseWords(rawWords: any[]): Word[] {
  return (rawWords || []).map((word: any) => ({
    ...word,
    conceptualStructure: parseConceptualStructure(word.conceptualStructure),
    createdAt: new Date(word.createdAt)
  }))
}

// Deserialize with migration support
export function deserializeState(jsonString: string): { domains: QualityDomain[], concepts: Concept[], instances: ConceptInstance[], words: Word[], libraryDomains: QualityDomain[] } {
  const parsed = JSON.parse(jsonString)
  const version = parsed.version || 1 // Default to version 1 if not specified

  // Version 4+ uses nested scene/library structure
  if (version >= 4 && parsed.scene) {
    const domains = parseDomains(parsed.scene.domains || [], version)
    const concepts = parseConcepts(parsed.scene.concepts || [], version)
    const instances = parseInstances(parsed.scene.instances || [])
    const words = parseWords(parsed.library?.words || [])
    // Version 5+ has library domains; for version 4, migrate by copying scene domains
    const libraryDomains = parsed.library?.domains
      ? parseDomains(parsed.library.domains, version)
      : parseDomains(parsed.scene.domains || [], version)
    return { domains, concepts, instances, words, libraryDomains }
  }

  // Versions 1-3: flat structure (backwards compatible migration)
  const domains = parseDomains(parsed.domains || [], version)
  const concepts = parseConcepts(parsed.concepts || [], version)
  const instances = parseInstances(parsed.instances || [])
  const words = parseWords(parsed.words || [])
  // For old versions, library domains mirror scene domains
  const libraryDomains = parseDomains(parsed.domains || [], version)

  return { domains, concepts, instances, words, libraryDomains }
}

export function saveToLocalStorage(state: AppState): void {
  try {
    const serialized = serializeState(state)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save state to localStorage:', error)
  }
}

export function loadFromLocalStorage(): { domains: QualityDomain[], concepts: Concept[], instances: ConceptInstance[], words: Word[], libraryDomains: QualityDomain[] } | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (!serialized) return null

    return deserializeState(serialized)
  } catch (error) {
    console.error('Failed to load state from localStorage:', error)
    return null
  }
}

export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}
