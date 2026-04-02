import type { QualityDomain, Concept, ConceptInstance, ConceptualStructure, QualityDomainLabel, Property, PropertyReference, LabelReference, DictionaryWord, Action } from './types'
import type { AppState } from '@/app/store'
import { DataParser } from '@/app/utils/dataParser'

const STORAGE_KEY = 'quality-domain-state'
const STATE_VERSION = 8 // Version 8 adds actions

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
        key === 'selectedItemId' ||
        key === 'selectedItemType' ||
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

// Use centralized parsing utilities from dataParser module
const parseDomains = DataParser.parseDomains
const parseConcepts = DataParser.parseConcepts
const parseInstances = DataParser.parseInstances
const parseConceptualStructure = DataParser.parseConceptualStructure
const parseDictionaryWords = DataParser.parseDictionaryWords

/**
 * Parse actions from raw JSON data.
 */
function parseActions(rawActions: any[]): Action[] {
  return (rawActions || []).map((action: any) => ({
    ...action,
    createdAt: new Date(action.createdAt),
  }))
}

// Deserialize with migration support
export function deserializeState(jsonString: string): { domains: QualityDomain[], concepts: Concept[], instances: ConceptInstance[], dictionaryWords: DictionaryWord[], libraryConcepts: Concept[], libraryDomains: QualityDomain[], actions: Action[] } {
  const parsed = JSON.parse(jsonString)
  const version = parsed.version || 1 // Default to version 1 if not specified

  // Version 4+ uses nested scene/library structure
  if (version >= 4 && parsed.scene) {
    const domains = parseDomains(parsed.scene.domains || [], version)
    const concepts = parseConcepts(parsed.scene.concepts || [], version)
    const instances = parseInstances(parsed.scene.instances || [])
    // Version 8+ has actions; older versions have none
    const actions = parsed.library?.actions
      ? parseActions(parsed.library.actions)
      : []
    // Version 7+ has dictionary words; older versions have none
    const dictionaryWords = parsed.library?.dictionaryWords
      ? parseDictionaryWords(parsed.library.dictionaryWords)
      : []
    // Version 6+ has library concepts; older versions have no library concepts
    const libraryConcepts = parsed.library?.concepts
      ? parseConcepts(parsed.library.concepts, version)
      : []
    // Version 5+ has library domains; for version 4, migrate by copying scene domains
    const libraryDomains = parsed.library?.domains
      ? parseDomains(parsed.library.domains, version)
      : parseDomains(parsed.scene.domains || [], version)
    return { domains, concepts, instances, dictionaryWords, libraryConcepts, libraryDomains, actions }
  }

  // Versions 1-3: flat structure (backwards compatible migration)
  const domains = parseDomains(parsed.domains || [], version)
  const concepts = parseConcepts(parsed.concepts || [], version)
  const instances = parseInstances(parsed.instances || [])
  // For old versions, no actions, dictionary words, or library concepts
  const actions: Action[] = []
  const dictionaryWords: DictionaryWord[] = []
  const libraryConcepts: Concept[] = []
  // For old versions, library domains mirror scene domains
  const libraryDomains = parseDomains(parsed.domains || [], version)

  return { domains, concepts, instances, dictionaryWords, libraryConcepts, libraryDomains, actions }
}

export function saveToLocalStorage(state: AppState): void {
  try {
    const serialized = serializeState(state)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save state to localStorage:', error)
  }
}

export function loadFromLocalStorage(): { domains: QualityDomain[], concepts: Concept[], instances: ConceptInstance[], dictionaryWords: DictionaryWord[], libraryConcepts: Concept[], libraryDomains: QualityDomain[], actions: Action[] } | null {
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
