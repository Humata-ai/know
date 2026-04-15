import type { QualityDomain, QualityDomainProperty, Concept, ConceptInstance, DictionaryWord, Action } from '../components/shared/types'

/**
 * Scene Action Types
 * 
 * Actions for state mutations related to the scene (domains, concepts, instances, selections).
 */
export type SceneAction =
  // Domain actions
  | { type: 'ADD_DOMAIN'; payload: QualityDomain }
  | { type: 'UPDATE_DOMAIN'; payload: QualityDomain }
  | { type: 'DELETE_DOMAIN'; payload: string }
  
  // Selection actions
  | { type: 'SELECT_DOMAIN'; payload: string | null }
  | { type: 'SELECT_PROPERTY'; payload: { domainId: string; propertyId: string } | null }
  | { type: 'SELECT_CONCEPT'; payload: string | null }
  | { type: 'SELECT_INSTANCE'; payload: string | null }
  | { type: 'CLEAR_SELECTION' }
  
  // Inspect text actions
  | { type: 'SET_INSPECT_TEXT'; payload: string }
  
  // Property actions
  | { type: 'ADD_PROPERTY'; payload: { domainId: string; property: QualityDomainProperty } }
  | { type: 'UPDATE_PROPERTY'; payload: { domainId: string; property: QualityDomainProperty } }
  | { type: 'DELETE_PROPERTY'; payload: { domainId: string; propertyId: string } }
  
  // Concept actions
  | { type: 'ADD_CONCEPT'; payload: Concept }
  | { type: 'UPDATE_CONCEPT'; payload: Concept }
  | { type: 'DELETE_CONCEPT'; payload: string }
  
  // Instance actions
  | { type: 'ADD_INSTANCE'; payload: ConceptInstance }
  | { type: 'UPDATE_INSTANCE'; payload: ConceptInstance }
  | { type: 'DELETE_INSTANCE'; payload: string }
  
  // State restoration
  | { type: 'RESTORE_SCENE_STATE'; payload: { domains: QualityDomain[]; concepts: Concept[]; instances: ConceptInstance[]; inspectText?: string } }
  | { type: 'MARK_RESTORED' }

/**
 * Library Selection Type
 * 
 * Identifies the type of item selected for viewing in the library 3D viewer.
 */
export type LibrarySelectionType = 'concept' | 'quality-domain'

/**
 * Library Action Types
 * 
 * Actions for state mutations related to the library (words and quality domains).
 */
export type LibraryAction =
  // Dictionary word actions
  | { type: 'ADD_DICTIONARY_WORD'; payload: DictionaryWord }
  | { type: 'UPDATE_DICTIONARY_WORD'; payload: DictionaryWord }
  | { type: 'DELETE_DICTIONARY_WORD'; payload: string }
  
  // Library concept actions
  | { type: 'ADD_LIBRARY_CONCEPT'; payload: Concept }
  | { type: 'UPDATE_LIBRARY_CONCEPT'; payload: Concept }
  | { type: 'DELETE_LIBRARY_CONCEPT'; payload: string }
  
  // Library quality domain actions
  | { type: 'ADD_LIBRARY_DOMAIN'; payload: QualityDomain }
  | { type: 'UPDATE_LIBRARY_DOMAIN'; payload: QualityDomain }
  | { type: 'DELETE_LIBRARY_DOMAIN'; payload: string }
  
  // Library action (verb) actions
  | { type: 'ADD_LIBRARY_ACTION'; payload: Action }
  | { type: 'UPDATE_LIBRARY_ACTION'; payload: Action }
  | { type: 'DELETE_LIBRARY_ACTION'; payload: string }
  
  // Library property actions
  | { type: 'ADD_LIBRARY_PROPERTY'; payload: { domainId: string; property: QualityDomainProperty } }
  | { type: 'UPDATE_LIBRARY_PROPERTY'; payload: { domainId: string; property: QualityDomainProperty } }
  | { type: 'DELETE_LIBRARY_PROPERTY'; payload: { domainId: string; propertyId: string } }
  
  // Library selection actions
  | { type: 'SELECT_LIBRARY_ITEM'; payload: { id: string; itemType: LibrarySelectionType } }
  | { type: 'CLEAR_LIBRARY_SELECTION' }
  
  // State restoration
  | { type: 'RESTORE_LIBRARY_STATE'; payload: { dictionaryWords: DictionaryWord[]; concepts: Concept[]; domains: QualityDomain[]; actions?: Action[] } }

/**
 * App Action
 * 
 * Union of all action types across all state slices.
 */
export type AppAction = SceneAction | LibraryAction

/**
 * Scene State
 * 
 * State for the scene view containing domains, concepts, instances,
 * and UI selection state.
 */
export interface SceneState {
  domains: QualityDomain[]
  selectedDomainId: string | null
  selectedPropertyId: string | null
  selectedPropertyDomainId: string | null
  selectedConceptId: string | null
  selectedInstanceId: string | null
  concepts: Concept[]
  instances: ConceptInstance[]
  hasRestoredState: boolean
  inspectText: string
}

/**
 * Library State
 * 
 * State for the library view containing concepts, quality domains,
 * and the currently selected item for 3D viewing.
 */
export interface LibraryState {
  dictionaryWords: DictionaryWord[]
  concepts: Concept[]
  domains: QualityDomain[]
  actions: Action[]
  selectedItemId: string | null
  selectedItemType: LibrarySelectionType | null
}

/**
 * App State
 * 
 * The root state of the application, composed of scene and library slices.
 */
export interface AppState {
  scene: SceneState
  library: LibraryState
}
