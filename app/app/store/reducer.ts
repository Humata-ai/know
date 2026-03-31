import type { AppState, AppAction, SceneState, SceneAction, LibraryState, LibraryAction } from './types'

/**
 * Scene Reducer
 * 
 * Handles all state mutations for the scene slice: domains, concepts, instances, and selections.
 */
export function sceneReducer(state: SceneState, action: SceneAction): SceneState {
  switch (action.type) {
    // Domain actions
    case 'ADD_DOMAIN':
      return {
        ...state,
        domains: [...state.domains, action.payload],
      }

    case 'UPDATE_DOMAIN':
      return {
        ...state,
        domains: state.domains.map((domain) =>
          domain.id === action.payload.id ? action.payload : domain
        ),
      }

    case 'DELETE_DOMAIN':
      return {
        ...state,
        domains: state.domains.filter((domain) => domain.id !== action.payload),
        selectedDomainId:
          state.selectedDomainId === action.payload ? null : state.selectedDomainId,
      }

    // Selection actions
    case 'SELECT_DOMAIN':
      return {
        ...state,
        selectedDomainId: action.payload,
        selectedLabelId: null,
        selectedLabelDomainId: null,
        selectedConceptId: null,
        selectedInstanceId: null,
      }

    case 'SELECT_LABEL':
      if (!action.payload) {
        return {
          ...state,
          selectedLabelId: null,
          selectedLabelDomainId: null,
        }
      }
      return {
        ...state,
        selectedDomainId: null,
        selectedLabelId: action.payload.labelId,
        selectedLabelDomainId: action.payload.domainId,
        selectedConceptId: null,
        selectedInstanceId: null,
      }

    case 'SELECT_CONCEPT':
      return {
        ...state,
        selectedDomainId: null,
        selectedLabelId: null,
        selectedLabelDomainId: null,
        selectedConceptId: action.payload,
        selectedInstanceId: null,
      }

    case 'SELECT_INSTANCE':
      const instance = action.payload
        ? state.instances.find(i => i.id === action.payload)
        : null
      return {
        ...state,
        selectedDomainId: null,
        selectedLabelId: null,
        selectedLabelDomainId: null,
        selectedConceptId: instance ? instance.conceptId : null,
        selectedInstanceId: action.payload,
      }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedDomainId: null,
        selectedLabelId: null,
        selectedLabelDomainId: null,
        selectedConceptId: null,
        selectedInstanceId: null,
      }

    // Label actions
    case 'ADD_LABEL':
      return {
        ...state,
        domains: state.domains.map((domain) =>
          domain.id === action.payload.domainId
            ? { ...domain, labels: [...domain.labels, action.payload.label] }
            : domain
        ),
      }

    case 'UPDATE_LABEL':
      return {
        ...state,
        domains: state.domains.map((domain) =>
          domain.id === action.payload.domainId
            ? {
                ...domain,
                labels: domain.labels.map((label) =>
                  label.id === action.payload.label.id ? action.payload.label : label
                ),
              }
            : domain
        ),
      }

    case 'DELETE_LABEL':
      return {
        ...state,
        domains: state.domains.map((domain) =>
          domain.id === action.payload.domainId
            ? {
                ...domain,
                labels: domain.labels.filter(
                  (label) => label.id !== action.payload.labelId
                ),
              }
            : domain
        ),
      }

    // Concept actions
    case 'ADD_CONCEPT':
      return {
        ...state,
        concepts: [...state.concepts, action.payload],
      }

    case 'UPDATE_CONCEPT':
      return {
        ...state,
        concepts: state.concepts.map((concept) =>
          concept.id === action.payload.id ? action.payload : concept
        ),
      }

    case 'DELETE_CONCEPT':
      return {
        ...state,
        concepts: state.concepts.filter((concept) => concept.id !== action.payload),
        instances: state.instances.filter((instance) => instance.conceptId !== action.payload),
      }

    // Instance actions
    case 'ADD_INSTANCE':
      return {
        ...state,
        instances: [...state.instances, action.payload],
      }

    case 'UPDATE_INSTANCE':
      return {
        ...state,
        instances: state.instances.map((instance) =>
          instance.id === action.payload.id ? action.payload : instance
        ),
      }

    case 'DELETE_INSTANCE':
      return {
        ...state,
        instances: state.instances.filter((instance) => instance.id !== action.payload),
      }

    // State restoration
    case 'RESTORE_SCENE_STATE':
      return {
        ...state,
        domains: action.payload.domains,
        concepts: action.payload.concepts,
        instances: action.payload.instances || [],
        selectedDomainId: null,
        selectedLabelId: null,
        selectedLabelDomainId: null,
        selectedConceptId: null,
        selectedInstanceId: null,
        hasRestoredState: true,
      }

    case 'MARK_RESTORED':
      return {
        ...state,
        hasRestoredState: true,
      }

    default:
      return state
  }
}

/**
 * Library Reducer
 * 
 * Handles all state mutations for the library slice: words.
 */
export function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    // Library concept actions
    case 'ADD_LIBRARY_CONCEPT':
      return {
        ...state,
        concepts: [...state.concepts, action.payload],
      }

    case 'UPDATE_LIBRARY_CONCEPT':
      return {
        ...state,
        concepts: state.concepts.map((concept) =>
          concept.id === action.payload.id ? action.payload : concept
        ),
      }

    case 'DELETE_LIBRARY_CONCEPT':
      return {
        ...state,
        concepts: state.concepts.filter((concept) => concept.id !== action.payload),
        // Clear selection if the deleted concept was selected
        selectedItemId: state.selectedItemType === 'concept' && state.selectedItemId === action.payload
          ? null : state.selectedItemId,
        selectedItemType: state.selectedItemType === 'concept' && state.selectedItemId === action.payload
          ? null : state.selectedItemType,
      }

    // Library quality domain actions
    case 'ADD_LIBRARY_DOMAIN':
      return {
        ...state,
        domains: [...state.domains, action.payload],
      }

    case 'UPDATE_LIBRARY_DOMAIN':
      return {
        ...state,
        domains: state.domains.map((domain) =>
          domain.id === action.payload.id ? action.payload : domain
        ),
      }

    case 'DELETE_LIBRARY_DOMAIN':
      return {
        ...state,
        domains: state.domains.filter((domain) => domain.id !== action.payload),
        // Clear selection if the deleted domain was selected
        selectedItemId: state.selectedItemType === 'quality-domain' && state.selectedItemId === action.payload
          ? null : state.selectedItemId,
        selectedItemType: state.selectedItemType === 'quality-domain' && state.selectedItemId === action.payload
          ? null : state.selectedItemType,
      }

    // Library selection actions
    case 'SELECT_LIBRARY_ITEM':
      return {
        ...state,
        selectedItemId: action.payload.id,
        selectedItemType: action.payload.itemType,
      }

    case 'CLEAR_LIBRARY_SELECTION':
      return {
        ...state,
        selectedItemId: null,
        selectedItemType: null,
      }

    // Library label actions
    case 'ADD_LIBRARY_LABEL':
      return {
        ...state,
        domains: state.domains.map((domain) =>
          domain.id === action.payload.domainId
            ? { ...domain, labels: [...domain.labels, action.payload.label] }
            : domain
        ),
      }

    case 'UPDATE_LIBRARY_LABEL':
      return {
        ...state,
        domains: state.domains.map((domain) =>
          domain.id === action.payload.domainId
            ? {
                ...domain,
                labels: domain.labels.map((label) =>
                  label.id === action.payload.label.id ? action.payload.label : label
                ),
              }
            : domain
        ),
      }

    case 'DELETE_LIBRARY_LABEL':
      return {
        ...state,
        domains: state.domains.map((domain) =>
          domain.id === action.payload.domainId
            ? {
                ...domain,
                labels: domain.labels.filter(
                  (label) => label.id !== action.payload.labelId
                ),
              }
            : domain
        ),
      }

    case 'RESTORE_LIBRARY_STATE':
      return {
        ...state,
        concepts: action.payload.concepts || [],
        domains: action.payload.domains || [],
        selectedItemId: null,
        selectedItemType: null,
      }

    default:
      return state
  }
}

/**
 * App Reducer
 * 
 * Composite reducer that delegates to scene and library sub-reducers.
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  // Determine which sub-reducer handles the action
  const sceneActionTypes = [
    'ADD_DOMAIN', 'UPDATE_DOMAIN', 'DELETE_DOMAIN',
    'SELECT_DOMAIN', 'SELECT_LABEL', 'SELECT_CONCEPT', 'SELECT_INSTANCE', 'CLEAR_SELECTION',
    'ADD_LABEL', 'UPDATE_LABEL', 'DELETE_LABEL',
    'ADD_CONCEPT', 'UPDATE_CONCEPT', 'DELETE_CONCEPT',
    'ADD_INSTANCE', 'UPDATE_INSTANCE', 'DELETE_INSTANCE',
    'RESTORE_SCENE_STATE', 'MARK_RESTORED',
  ]

  const libraryActionTypes = [
    'ADD_LIBRARY_CONCEPT', 'UPDATE_LIBRARY_CONCEPT', 'DELETE_LIBRARY_CONCEPT',
    'ADD_LIBRARY_DOMAIN', 'UPDATE_LIBRARY_DOMAIN', 'DELETE_LIBRARY_DOMAIN',
    'ADD_LIBRARY_LABEL', 'UPDATE_LIBRARY_LABEL', 'DELETE_LIBRARY_LABEL',
    'SELECT_LIBRARY_ITEM', 'CLEAR_LIBRARY_SELECTION',
    'RESTORE_LIBRARY_STATE',
  ]

  if (sceneActionTypes.includes(action.type)) {
    return {
      ...state,
      scene: sceneReducer(state.scene, action as SceneAction),
    }
  }

  if (libraryActionTypes.includes(action.type)) {
    return {
      ...state,
      library: libraryReducer(state.library, action as LibraryAction),
    }
  }

  return state
}
