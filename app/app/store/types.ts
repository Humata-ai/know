import type { QualityDomain, QualityDomainLabel, Concept, ConceptInstance } from '../components/shared/types'

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
  | { type: 'SELECT_LABEL'; payload: { domainId: string; labelId: string } | null }
  | { type: 'SELECT_CONCEPT'; payload: string | null }
  | { type: 'SELECT_INSTANCE'; payload: string | null }
  | { type: 'CLEAR_SELECTION' }
  
  // Label actions
  | { type: 'ADD_LABEL'; payload: { domainId: string; label: QualityDomainLabel } }
  | { type: 'UPDATE_LABEL'; payload: { domainId: string; label: QualityDomainLabel } }
  | { type: 'DELETE_LABEL'; payload: { domainId: string; labelId: string } }
  
  // Concept actions
  | { type: 'ADD_CONCEPT'; payload: Concept }
  | { type: 'UPDATE_CONCEPT'; payload: Concept }
  | { type: 'DELETE_CONCEPT'; payload: string }
  
  // Instance actions
  | { type: 'ADD_INSTANCE'; payload: ConceptInstance }
  | { type: 'UPDATE_INSTANCE'; payload: ConceptInstance }
  | { type: 'DELETE_INSTANCE'; payload: string }
  
  // State restoration
  | { type: 'RESTORE_SCENE_STATE'; payload: { domains: QualityDomain[]; concepts: Concept[]; instances: ConceptInstance[] } }
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
  // Library concept actions
  | { type: 'ADD_LIBRARY_CONCEPT'; payload: Concept }
  | { type: 'UPDATE_LIBRARY_CONCEPT'; payload: Concept }
  | { type: 'DELETE_LIBRARY_CONCEPT'; payload: string }
  
  // Library quality domain actions
  | { type: 'ADD_LIBRARY_DOMAIN'; payload: QualityDomain }
  | { type: 'UPDATE_LIBRARY_DOMAIN'; payload: QualityDomain }
  | { type: 'DELETE_LIBRARY_DOMAIN'; payload: string }
  
  // Library label actions
  | { type: 'ADD_LIBRARY_LABEL'; payload: { domainId: string; label: QualityDomainLabel } }
  | { type: 'UPDATE_LIBRARY_LABEL'; payload: { domainId: string; label: QualityDomainLabel } }
  | { type: 'DELETE_LIBRARY_LABEL'; payload: { domainId: string; labelId: string } }
  
  // Library selection actions
  | { type: 'SELECT_LIBRARY_ITEM'; payload: { id: string; itemType: LibrarySelectionType } }
  | { type: 'CLEAR_LIBRARY_SELECTION' }
  
  // State restoration
  | { type: 'RESTORE_LIBRARY_STATE'; payload: { concepts: Concept[]; domains: QualityDomain[] } }

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
  selectedLabelId: string | null
  selectedLabelDomainId: string | null
  selectedConceptId: string | null
  selectedInstanceId: string | null
  concepts: Concept[]
  instances: ConceptInstance[]
  hasRestoredState: boolean
}

/**
 * Library State
 * 
 * State for the library view containing concepts, quality domains,
 * and the currently selected item for 3D viewing.
 */
export interface LibraryState {
  concepts: Concept[]
  domains: QualityDomain[]
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
