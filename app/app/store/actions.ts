import type { SceneAction, LibraryAction } from './types'
import type { QualityDomain, QualityDomainLabel, Concept, ConceptInstance, Word } from '../components/shared/types'

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

export const addWord = (word: Word): LibraryAction => ({
  type: 'ADD_WORD',
  payload: word,
})

export const updateWord = (word: Word): LibraryAction => ({
  type: 'UPDATE_WORD',
  payload: word,
})

export const deleteWord = (id: string): LibraryAction => ({
  type: 'DELETE_WORD',
  payload: id,
})

export const selectWord = (wordId: string | null): LibraryAction => ({
  type: 'SELECT_WORD',
  payload: wordId,
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

export const restoreLibraryState = (
  words: Word[] = [],
  domains: QualityDomain[] = [],
): LibraryAction => ({
  type: 'RESTORE_LIBRARY_STATE',
  payload: { words, domains },
})
