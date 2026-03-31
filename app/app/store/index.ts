/**
 * App Store
 * 
 * Central state management for the application.
 * Manages scene state (domains, concepts, instances) and library state (words).
 */

// Context and hooks
export { AppStoreProvider, useAppStore, useQualityDomain } from './AppStoreContext'

// Types
export type { AppState, AppAction, SceneState, SceneAction, LibraryState, LibraryAction, LibrarySelectionType } from './types'

// Reducer
export { appReducer, sceneReducer, libraryReducer } from './reducer'

// Initial state
export { initialState } from './initialState'

// Action creators
export * as actions from './actions'

// Selectors
export * as selectors from './selectors'
