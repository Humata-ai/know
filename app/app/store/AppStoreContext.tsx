'use client'

import { createContext, useContext, useReducer, useMemo, useCallback, useEffect, type ReactNode } from 'react'
import type { AppState, AppAction } from './types'
import type { QualityDomain, QualityDomainLabel, Concept, ConceptInstance, QualityDomainPoint, Word } from '../components/shared/types'
import { appReducer } from './reducer'
import { initialState } from './initialState'
import { 
  getSelectedDomain, 
  getConceptLabels, 
  getInstancePoints, 
  getConceptInstances 
} from './selectors'
import { saveToLocalStorage } from '../components/shared/localStorage'

/**
 * App Store Context Type
 * 
 * Provides access to the app state, dispatch function, and convenient action methods.
 */
interface AppStoreContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  
  // Domain methods
  addDomain: (domain: QualityDomain) => void
  updateDomain: (domain: QualityDomain) => void
  deleteDomain: (id: string) => void
  
  // Selection methods
  selectDomain: (id: string | null) => void
  selectLabel: (domainId: string, labelId: string) => void
  selectConcept: (conceptId: string | null) => void
  selectInstance: (instanceId: string | null) => void
  clearSelection: () => void
  
  // Label methods
  addLabel: (domainId: string, label: QualityDomainLabel) => void
  updateLabel: (domainId: string, label: QualityDomainLabel) => void
  deleteLabel: (domainId: string, labelId: string) => void
  
  // Concept methods
  addConcept: (concept: Concept) => void
  updateConcept: (concept: Concept) => void
  deleteConcept: (id: string) => void
  
  // Instance methods
  addInstance: (instance: ConceptInstance) => void
  updateInstance: (instance: ConceptInstance) => void
  deleteInstance: (id: string) => void
  
  // Word methods
  addWord: (word: Word) => void
  updateWord: (word: Word) => void
  deleteWord: (id: string) => void
  selectWord: (wordId: string | null) => void
  
  // Library quality domain methods
  addLibraryDomain: (domain: QualityDomain) => void
  updateLibraryDomain: (domain: QualityDomain) => void
  deleteLibraryDomain: (id: string) => void
  
  // Selector methods (operate on scene state)
  getSelectedDomain: () => QualityDomain | null
  getConceptLabels: (conceptId: string) => QualityDomainLabel[]
  getInstancePoints: (instanceId: string) => QualityDomainPoint[]
  getConceptInstances: (conceptId: string) => ConceptInstance[]
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined)

/**
 * App Store Provider
 * 
 * Wraps the application and provides access to the app store.
 * Automatically persists state changes to localStorage.
 */
export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Auto-save to localStorage on every state change, but only after restoration is done
  useEffect(() => {
    if (!state.scene.hasRestoredState) return
    saveToLocalStorage(state)
  }, [state])

  // Memoize action methods to prevent recreation on every render
  const addDomainMethod = useCallback((domain: QualityDomain) => {
    dispatch({ type: 'ADD_DOMAIN', payload: domain })
  }, [])

  const updateDomainMethod = useCallback((domain: QualityDomain) => {
    dispatch({ type: 'UPDATE_DOMAIN', payload: domain })
  }, [])

  const deleteDomainMethod = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DOMAIN', payload: id })
  }, [])

  const selectDomainMethod = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_DOMAIN', payload: id })
  }, [])

  const selectLabelMethod = useCallback((domainId: string, labelId: string) => {
    dispatch({ type: 'SELECT_LABEL', payload: { domainId, labelId } })
  }, [])

  const selectConceptMethod = useCallback((conceptId: string | null) => {
    dispatch({ type: 'SELECT_CONCEPT', payload: conceptId })
  }, [])

  const selectInstanceMethod = useCallback((instanceId: string | null) => {
    dispatch({ type: 'SELECT_INSTANCE', payload: instanceId })
  }, [])

  const clearSelectionMethod = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' })
  }, [])

  const addLabelMethod = useCallback((domainId: string, label: QualityDomainLabel) => {
    dispatch({ type: 'ADD_LABEL', payload: { domainId, label } })
  }, [])

  const updateLabelMethod = useCallback((domainId: string, label: QualityDomainLabel) => {
    dispatch({ type: 'UPDATE_LABEL', payload: { domainId, label } })
  }, [])

  const deleteLabelMethod = useCallback((domainId: string, labelId: string) => {
    dispatch({ type: 'DELETE_LABEL', payload: { domainId, labelId } })
  }, [])

  const addConceptMethod = useCallback((concept: Concept) => {
    dispatch({ type: 'ADD_CONCEPT', payload: concept })
  }, [])

  const updateConceptMethod = useCallback((concept: Concept) => {
    dispatch({ type: 'UPDATE_CONCEPT', payload: concept })
  }, [])

  const deleteConceptMethod = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONCEPT', payload: id })
  }, [])

  const addInstanceMethod = useCallback((instance: ConceptInstance) => {
    dispatch({ type: 'ADD_INSTANCE', payload: instance })
  }, [])

  const updateInstanceMethod = useCallback((instance: ConceptInstance) => {
    dispatch({ type: 'UPDATE_INSTANCE', payload: instance })
  }, [])

  const deleteInstanceMethod = useCallback((id: string) => {
    dispatch({ type: 'DELETE_INSTANCE', payload: id })
  }, [])

  const addWordMethod = useCallback((word: Word) => {
    dispatch({ type: 'ADD_WORD', payload: word })
  }, [])

  const updateWordMethod = useCallback((word: Word) => {
    dispatch({ type: 'UPDATE_WORD', payload: word })
  }, [])

  const deleteWordMethod = useCallback((id: string) => {
    dispatch({ type: 'DELETE_WORD', payload: id })
  }, [])

  const selectWordMethod = useCallback((wordId: string | null) => {
    dispatch({ type: 'SELECT_WORD', payload: wordId })
  }, [])

  const addLibraryDomainMethod = useCallback((domain: QualityDomain) => {
    dispatch({ type: 'ADD_LIBRARY_DOMAIN', payload: domain })
  }, [])

  const updateLibraryDomainMethod = useCallback((domain: QualityDomain) => {
    dispatch({ type: 'UPDATE_LIBRARY_DOMAIN', payload: domain })
  }, [])

  const deleteLibraryDomainMethod = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LIBRARY_DOMAIN', payload: id })
  }, [])

  // Memoize selector methods - selectors now operate on scene state
  const getSelectedDomainMethod = useCallback(() => {
    return getSelectedDomain(state.scene)
  }, [state.scene])

  const getConceptLabelsMethod = useCallback((conceptId: string) => {
    return getConceptLabels(state.scene, conceptId)
  }, [state.scene])

  const getInstancePointsMethod = useCallback((instanceId: string) => {
    return getInstancePoints(state.scene, instanceId)
  }, [state.scene])

  const getConceptInstancesMethod = useCallback((conceptId: string) => {
    return getConceptInstances(state.scene, conceptId)
  }, [state.scene])

  // Memoize context value to only recreate when necessary
  const value: AppStoreContextType = useMemo(() => ({
    state,
    dispatch,
    addDomain: addDomainMethod,
    updateDomain: updateDomainMethod,
    deleteDomain: deleteDomainMethod,
    selectDomain: selectDomainMethod,
    selectLabel: selectLabelMethod,
    selectConcept: selectConceptMethod,
    selectInstance: selectInstanceMethod,
    clearSelection: clearSelectionMethod,
    addLabel: addLabelMethod,
    updateLabel: updateLabelMethod,
    deleteLabel: deleteLabelMethod,
    addConcept: addConceptMethod,
    updateConcept: updateConceptMethod,
    deleteConcept: deleteConceptMethod,
    addInstance: addInstanceMethod,
    updateInstance: updateInstanceMethod,
    deleteInstance: deleteInstanceMethod,
    addWord: addWordMethod,
    updateWord: updateWordMethod,
    deleteWord: deleteWordMethod,
    selectWord: selectWordMethod,
    addLibraryDomain: addLibraryDomainMethod,
    updateLibraryDomain: updateLibraryDomainMethod,
    deleteLibraryDomain: deleteLibraryDomainMethod,
    getSelectedDomain: getSelectedDomainMethod,
    getConceptLabels: getConceptLabelsMethod,
    getInstancePoints: getInstancePointsMethod,
    getConceptInstances: getConceptInstancesMethod,
  }), [
    state,
    addDomainMethod,
    updateDomainMethod,
    deleteDomainMethod,
    selectDomainMethod,
    selectLabelMethod,
    selectConceptMethod,
    selectInstanceMethod,
    clearSelectionMethod,
    addLabelMethod,
    updateLabelMethod,
    deleteLabelMethod,
    addConceptMethod,
    updateConceptMethod,
    deleteConceptMethod,
    addInstanceMethod,
    updateInstanceMethod,
    deleteInstanceMethod,
    addWordMethod,
    updateWordMethod,
    deleteWordMethod,
    selectWordMethod,
    addLibraryDomainMethod,
    updateLibraryDomainMethod,
    deleteLibraryDomainMethod,
    getSelectedDomainMethod,
    getConceptLabelsMethod,
    getInstancePointsMethod,
    getConceptInstancesMethod,
  ])

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  )
}

/**
 * Hook to access the app store
 * 
 * Must be used within an AppStoreProvider.
 */
export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppStoreProvider')
  }
  return context
}

/**
 * Legacy hook alias for backward compatibility
 * @deprecated Use useAppStore instead
 */
export function useQualityDomain() {
  return useAppStore()
}
