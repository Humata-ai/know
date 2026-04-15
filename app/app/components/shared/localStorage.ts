import type { QualityDomain, Concept, ConceptInstance, ConceptualStructure, QualityDomainLabel, Property, PropertyReference, LabelReference, DictionaryWord, Action } from './types'
import type { AppState } from '@/app/store'
import { DataParser } from '@/app/utils/dataParser'

const STORAGE_KEY = 'quality-domain-state'
const STATE_VERSION = 8 // Version 8 adds actions

// Type for parsed JSON actions
interface JsonAction {
  id: string
  name: string
  verbType: 'manner' | 'result'
  createdAt: string
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
        key === 'selectedPropertyId' ||
        key === 'selectedPropertyDomainId' ||
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
function parseActions(rawActions: JsonAction[]): Action[] {
  return (rawActions || []).map((action) => ({
    ...action,
    createdAt: new Date(action.createdAt),
  }))
}

// Deserialize with migration support
export function deserializeState(jsonString: string): { domains: QualityDomain[], concepts: Concept[], instances: ConceptInstance[], dictionaryWords: DictionaryWord[], libraryConcepts: Concept[], libraryDomains: QualityDomain[], actions: Action[], inspectText: string } {
  const parsed = JSON.parse(jsonString) as unknown
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid JSON structure')
  }
  const data = parsed as Record<string, unknown>
  const version = (data.version as number) || 1 // Default to version 1 if not specified

  // Version 4+ uses nested scene/library structure
  if (version >= 4 && data.scene) {
    const scene = data.scene as Record<string, unknown>
    const library = data.library as Record<string, unknown> | undefined
    
    const domains = parseDomains((scene.domains as any[]) || [], version)
    const concepts = parseConcepts((scene.concepts as any[]) || [], version)
    const instances = parseInstances((scene.instances as any[]) || [])
    const inspectText = (scene.inspectText as string) || ''
    // Version 8+ has actions; older versions have none
    const actions = library?.actions
      ? parseActions(library.actions as JsonAction[])
      : []
    // Version 7+ has dictionary words; older versions have none
    const dictionaryWords = library?.dictionaryWords
      ? parseDictionaryWords(library.dictionaryWords as any[])
      : []
    // Version 6+ has library concepts; older versions have no library concepts
    const libraryConcepts = library?.concepts
      ? parseConcepts(library.concepts as any[], version)
      : []
    // Version 5+ has library domains; for version 4, migrate by copying scene domains
    const libraryDomains = library?.domains
      ? parseDomains(library.domains as any[], version)
      : parseDomains((scene.domains as any[]) || [], version)
    return { domains, concepts, instances, dictionaryWords, libraryConcepts, libraryDomains, actions, inspectText }
  }

  // Versions 1-3: flat structure (backwards compatible migration)
  const domains = parseDomains((data.domains as any[]) || [], version)
  const concepts = parseConcepts((data.concepts as any[]) || [], version)
  const instances = parseInstances((data.instances as any[]) || [])
  // For old versions, no actions, dictionary words, or library concepts
  const actions: Action[] = []
  const dictionaryWords: DictionaryWord[] = []
  const libraryConcepts: Concept[] = []
  const inspectText = ''
  // For old versions, library domains mirror scene domains
  const libraryDomains = parseDomains((data.domains as any[]) || [], version)

  return { domains, concepts, instances, dictionaryWords, libraryConcepts, libraryDomains, actions, inspectText }
}

export function saveToLocalStorage(state: AppState): void {
  try {
    const serialized = serializeState(state)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save state to localStorage:', error)
  }
}

export function loadFromLocalStorage(): { domains: QualityDomain[], concepts: Concept[], instances: ConceptInstance[], dictionaryWords: DictionaryWord[], libraryConcepts: Concept[], libraryDomains: QualityDomain[], actions: Action[], inspectText: string } | null {
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
