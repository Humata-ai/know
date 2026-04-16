'use client'

import { createContext, useContext, useReducer, useMemo, useCallback, useEffect, type ReactNode } from 'react'
import type { AppState, AppAction, LibrarySelectionType } from './types'
import type { QualityDomain, QualityDomainProperty, Concept, ConceptInstance, QualityDomainPoint, DictionaryWord, Action } from '../components/shared/types'
import { appReducer } from './reducer'
import { initialState } from './initialState'
import { 
  getSelectedDomain, 
  getConceptProperties, 
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
  selectLabel: (domainId: string, propertyId: string) => void
  selectConcept: (conceptId: string | null) => void
  selectInstance: (instanceId: string | null) => void
  clearSelection: () => void
  
  // Property methods (aliases for label methods)
  addProperty: (domainId: string, property: QualityDomainProperty) => void
  updateProperty: (domainId: string, property: QualityDomainProperty) => void
  deleteProperty: (domainId: string, propertyId: string) => void
  selectProperty: (domainId: string, propertyId: string) => void
  
  // Label methods (deprecated - use property methods)
  addLabel: (domainId: string, property: QualityDomainProperty) => void
  updateLabel: (domainId: string, property: QualityDomainProperty) => void
  deleteLabel: (domainId: string, propertyId: string) => void
  
  // Concept methods
  addConcept: (concept: Concept) => void
  updateConcept: (concept: Concept) => void
  deleteConcept: (id: string) => void
  
  // Instance methods
  addInstance: (instance: ConceptInstance) => void
  updateInstance: (instance: ConceptInstance) => void
  deleteInstance: (id: string) => void
  
  // Dictionary word methods
  addDictionaryWord: (word: DictionaryWord) => void
  updateDictionaryWord: (word: DictionaryWord) => void
  deleteDictionaryWord: (id: string) => void
  
  // Library concept methods
  addLibraryConcept: (concept: Concept) => void
  updateLibraryConcept: (concept: Concept) => void
  deleteLibraryConcept: (id: string) => void
  
  // Library quality domain methods
  addLibraryDomain: (domain: QualityDomain) => void
  updateLibraryDomain: (domain: QualityDomain) => void
  deleteLibraryDomain: (id: string) => void
  
  // Library action methods
  addLibraryAction: (action: Action) => void
  updateLibraryAction: (action: Action) => void
  deleteLibraryAction: (id: string) => void
  
  // Library property methods (aliases for label methods)
  addLibraryProperty: (domainId: string, property: QualityDomainProperty) => void
  updateLibraryProperty: (domainId: string, property: QualityDomainProperty) => void
  deleteLibraryProperty: (domainId: string, propertyId: string) => void
  
  // Library label methods (deprecated - use property methods)
  addLibraryLabel: (domainId: string, property: QualityDomainProperty) => void
  updateLibraryLabel: (domainId: string, property: QualityDomainProperty) => void
  deleteLibraryLabel: (domainId: string, propertyId: string) => void
  
  // Library selection methods
  selectLibraryItem: (id: string, itemType: LibrarySelectionType) => void
  clearLibrarySelection: () => void
  
  // Selector methods (operate on scene state)
  getSelectedDomain: () => QualityDomain | null
  getConceptProperties: (conceptId: string) => QualityDomainProperty[]
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

  const selectLabelMethod = useCallback((domainId: string, propertyId: string) => {
    dispatch({ type: 'SELECT_PROPERTY', payload: { domainId, propertyId } })
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

  const addLabelMethod = useCallback((domainId: string, property: QualityDomainProperty) => {
    dispatch({ type: 'ADD_PROPERTY', payload: { domainId, property } })
  }, [])

  const updateLabelMethod = useCallback((domainId: string, property: QualityDomainProperty) => {
    dispatch({ type: 'UPDATE_PROPERTY', payload: { domainId, property } })
  }, [])

  const deleteLabelMethod = useCallback((domainId: string, propertyId: string) => {
    dispatch({ type: 'DELETE_PROPERTY', payload: { domainId, propertyId } })
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

  const addDictionaryWordMethod = useCallback((word: DictionaryWord) => {
    dispatch({ type: 'ADD_DICTIONARY_WORD', payload: word })
  }, [])

  const updateDictionaryWordMethod = useCallback((word: DictionaryWord) => {
    dispatch({ type: 'UPDATE_DICTIONARY_WORD', payload: word })
  }, [])

  const deleteDictionaryWordMethod = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DICTIONARY_WORD', payload: id })
  }, [])

  const addLibraryConceptMethod = useCallback((concept: Concept) => {
    dispatch({ type: 'ADD_LIBRARY_CONCEPT', payload: concept })
  }, [])

  const updateLibraryConceptMethod = useCallback((concept: Concept) => {
    dispatch({ type: 'UPDATE_LIBRARY_CONCEPT', payload: concept })
  }, [])

  const deleteLibraryConceptMethod = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LIBRARY_CONCEPT', payload: id })
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

  const addLibraryActionMethod = useCallback((action: Action) => {
    dispatch({ type: 'ADD_LIBRARY_ACTION', payload: action })
  }, [])

  const updateLibraryActionMethod = useCallback((action: Action) => {
    dispatch({ type: 'UPDATE_LIBRARY_ACTION', payload: action })
  }, [])

  const deleteLibraryActionMethod = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LIBRARY_ACTION', payload: id })
  }, [])

  const addLibraryLabelMethod = useCallback((domainId: string, property: QualityDomainProperty) => {
    dispatch({ type: 'ADD_LIBRARY_PROPERTY', payload: { domainId, property } })
  }, [])

  const updateLibraryLabelMethod = useCallback((domainId: string, property: QualityDomainProperty) => {
    dispatch({ type: 'UPDATE_LIBRARY_PROPERTY', payload: { domainId, property } })
  }, [])

  const deleteLibraryLabelMethod = useCallback((domainId: string, propertyId: string) => {
    dispatch({ type: 'DELETE_LIBRARY_PROPERTY', payload: { domainId, propertyId } })
  }, [])

  const selectLibraryItemMethod = useCallback((id: string, itemType: LibrarySelectionType) => {
    dispatch({ type: 'SELECT_LIBRARY_ITEM', payload: { id, itemType } })
  }, [])

  const clearLibrarySelectionMethod = useCallback(() => {
    dispatch({ type: 'CLEAR_LIBRARY_SELECTION' })
  }, [])

  // Memoize selector methods - selectors now operate on scene state
  const getSelectedDomainMethod = useCallback(() => {
    return getSelectedDomain(state.scene)
  }, [state.scene])

  const getConceptPropertiesMethod = useCallback((conceptId: string) => {
    return getConceptProperties(state.scene, conceptId)
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
    selectProperty: selectLabelMethod, // Alias
    selectConcept: selectConceptMethod,
    selectInstance: selectInstanceMethod,
    clearSelection: clearSelectionMethod,
    addLabel: addLabelMethod,
    updateLabel: updateLabelMethod,
    deleteLabel: deleteLabelMethod,
    addProperty: addLabelMethod, // Alias
    updateProperty: updateLabelMethod, // Alias
    deleteProperty: deleteLabelMethod, // Alias
    addConcept: addConceptMethod,
    updateConcept: updateConceptMethod,
    deleteConcept: deleteConceptMethod,
    addInstance: addInstanceMethod,
    updateInstance: updateInstanceMethod,
    deleteInstance: deleteInstanceMethod,
    addDictionaryWord: addDictionaryWordMethod,
    updateDictionaryWord: updateDictionaryWordMethod,
    deleteDictionaryWord: deleteDictionaryWordMethod,
    addLibraryConcept: addLibraryConceptMethod,
    updateLibraryConcept: updateLibraryConceptMethod,
    deleteLibraryConcept: deleteLibraryConceptMethod,
    addLibraryDomain: addLibraryDomainMethod,
    updateLibraryDomain: updateLibraryDomainMethod,
    deleteLibraryDomain: deleteLibraryDomainMethod,
    addLibraryAction: addLibraryActionMethod,
    updateLibraryAction: updateLibraryActionMethod,
    deleteLibraryAction: deleteLibraryActionMethod,
    addLibraryLabel: addLibraryLabelMethod,
    updateLibraryLabel: updateLibraryLabelMethod,
    deleteLibraryLabel: deleteLibraryLabelMethod,
    addLibraryProperty: addLibraryLabelMethod, // Alias
    updateLibraryProperty: updateLibraryLabelMethod, // Alias
    deleteLibraryProperty: deleteLibraryLabelMethod, // Alias
    selectLibraryItem: selectLibraryItemMethod,
    clearLibrarySelection: clearLibrarySelectionMethod,
    getSelectedDomain: getSelectedDomainMethod,
    getConceptProperties: getConceptPropertiesMethod,
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
    addDictionaryWordMethod,
    updateDictionaryWordMethod,
    deleteDictionaryWordMethod,
    addLibraryConceptMethod,
    updateLibraryConceptMethod,
    deleteLibraryConceptMethod,
    addLibraryDomainMethod,
    updateLibraryDomainMethod,
    deleteLibraryDomainMethod,
    addLibraryActionMethod,
    updateLibraryActionMethod,
    deleteLibraryActionMethod,
    addLibraryLabelMethod,
    updateLibraryLabelMethod,
    deleteLibraryLabelMethod,
    selectLibraryItemMethod,
    clearLibrarySelectionMethod,
    getSelectedDomainMethod,
    getConceptPropertiesMethod,
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
