import type { SceneAction, LibraryAction, LibrarySelectionType } from './types'
import type { QualityDomain, QualityDomainLabel, Concept, ConceptInstance, DictionaryWord, Action } from '../components/shared/types'

/**
 * Scene Action Creators
 * 
 * Helper functions for creating scene actions with proper typing.
 */

// Domain action creators
export const addDomain = (domain: QualityDomain): SceneAction => ({
  type: 'ADD_DOMAIN',
  payload: domain,
})

export const updateDomain = (domain: QualityDomain): SceneAction => ({
  type: 'UPDATE_DOMAIN',
  payload: domain,
})

export const deleteDomain = (id: string): SceneAction => ({
  type: 'DELETE_DOMAIN',
  payload: id,
})

// Selection action creators
export const selectDomain = (id: string | null): SceneAction => ({
  type: 'SELECT_DOMAIN',
  payload: id,
})

export const selectLabel = (domainId: string, labelId: string): SceneAction => ({
  type: 'SELECT_LABEL',
  payload: { domainId, labelId },
})

export const deselectLabel = (): SceneAction => ({
  type: 'SELECT_LABEL',
  payload: null,
})

export const selectConcept = (conceptId: string | null): SceneAction => ({
  type: 'SELECT_CONCEPT',
  payload: conceptId,
})

export const selectInstance = (instanceId: string | null): SceneAction => ({
  type: 'SELECT_INSTANCE',
  payload: instanceId,
})

export const clearSelection = (): SceneAction => ({
  type: 'CLEAR_SELECTION',
})

// Label action creators
export const addLabel = (domainId: string, label: QualityDomainLabel): SceneAction => ({
  type: 'ADD_LABEL',
  payload: { domainId, label },
})

export const updateLabel = (domainId: string, label: QualityDomainLabel): SceneAction => ({
  type: 'UPDATE_LABEL',
  payload: { domainId, label },
})

export const deleteLabel = (domainId: string, labelId: string): SceneAction => ({
  type: 'DELETE_LABEL',
  payload: { domainId, labelId },
})

// Concept action creators
export const addConcept = (concept: Concept): SceneAction => ({
  type: 'ADD_CONCEPT',
  payload: concept,
})

export const updateConcept = (concept: Concept): SceneAction => ({
  type: 'UPDATE_CONCEPT',
  payload: concept,
})

export const deleteConcept = (id: string): SceneAction => ({
  type: 'DELETE_CONCEPT',
  payload: id,
})

// Instance action creators
export const addInstance = (instance: ConceptInstance): SceneAction => ({
  type: 'ADD_INSTANCE',
  payload: instance,
})

export const updateInstance = (instance: ConceptInstance): SceneAction => ({
  type: 'UPDATE_INSTANCE',
  payload: instance,
})

export const deleteInstance = (id: string): SceneAction => ({
  type: 'DELETE_INSTANCE',
  payload: id,
})

// Scene state restoration action creator
export const restoreSceneState = (
  domains: QualityDomain[],
  concepts: Concept[],
  instances: ConceptInstance[],
): SceneAction => ({
  type: 'RESTORE_SCENE_STATE',
  payload: { domains, concepts, instances },
})

/**
 * Library Action Creators
 * 
 * Helper functions for creating library actions with proper typing.
 */

// Dictionary word action creators
export const addDictionaryWord = (word: DictionaryWord): LibraryAction => ({
  type: 'ADD_DICTIONARY_WORD',
  payload: word,
})

export const updateDictionaryWord = (word: DictionaryWord): LibraryAction => ({
  type: 'UPDATE_DICTIONARY_WORD',
  payload: word,
})

export const deleteDictionaryWord = (id: string): LibraryAction => ({
  type: 'DELETE_DICTIONARY_WORD',
  payload: id,
})

// Library concept action creators
export const addLibraryConcept = (concept: Concept): LibraryAction => ({
  type: 'ADD_LIBRARY_CONCEPT',
  payload: concept,
})

export const updateLibraryConcept = (concept: Concept): LibraryAction => ({
  type: 'UPDATE_LIBRARY_CONCEPT',
  payload: concept,
})

export const deleteLibraryConcept = (id: string): LibraryAction => ({
  type: 'DELETE_LIBRARY_CONCEPT',
  payload: id,
})

// Library quality domain action creators
export const addLibraryDomain = (domain: QualityDomain): LibraryAction => ({
  type: 'ADD_LIBRARY_DOMAIN',
  payload: domain,
})

export const updateLibraryDomain = (domain: QualityDomain): LibraryAction => ({
  type: 'UPDATE_LIBRARY_DOMAIN',
  payload: domain,
})

export const deleteLibraryDomain = (id: string): LibraryAction => ({
  type: 'DELETE_LIBRARY_DOMAIN',
  payload: id,
})

// Library action (verb) action creators
export const addLibraryAction = (action: Action): LibraryAction => ({
  type: 'ADD_LIBRARY_ACTION',
  payload: action,
})

export const updateLibraryAction = (action: Action): LibraryAction => ({
  type: 'UPDATE_LIBRARY_ACTION',
  payload: action,
})

export const deleteLibraryAction = (id: string): LibraryAction => ({
  type: 'DELETE_LIBRARY_ACTION',
  payload: id,
})

// Library selection action creators
export const selectLibraryItem = (id: string, itemType: LibrarySelectionType): LibraryAction => ({
  type: 'SELECT_LIBRARY_ITEM',
  payload: { id, itemType },
})

export const clearLibrarySelection = (): LibraryAction => ({
  type: 'CLEAR_LIBRARY_SELECTION',
})

export const restoreLibraryState = (
  dictionaryWords: DictionaryWord[] = [],
  concepts: Concept[] = [],
  domains: QualityDomain[] = [],
): LibraryAction => ({
  type: 'RESTORE_LIBRARY_STATE',
  payload: { dictionaryWords, concepts, domains },
})
