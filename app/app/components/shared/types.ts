import { z } from 'zod'
import {
  QualityDimensionSchema,
  RegionDimensionRangeSchema,
  PointDimensionValueSchema,
  QualityDomainRegionSchema,
  QualityDomainPointSchema,
  QualityDomainPropertySchema,
  QualityDomainSchema,
  PropertyReferenceSchema,
  PointReferenceSchema,
  ConceptSchema,
  ConceptInstanceSchema,
  ConceptualStructureSchema,
  WordClassSchema,
  WordSchema,
  DictionaryWordSchema,
  VerbTypeSchema,
  ActionSchema,
} from './schemas'

// ===== Inferred Types from Zod Schemas =====

export type QualityDimension = z.infer<typeof QualityDimensionSchema>

// ===== Region/Point Property Types (Discriminated Union) =====

export type RegionDimensionRange = z.infer<typeof RegionDimensionRangeSchema>
export type PointDimensionValue = z.infer<typeof PointDimensionValueSchema>

// Base interface for properties (kept as manual type since it's not directly used by consumers)
export interface QualityDomainPropertyBase {
  id: string
  name: string
  domainId: string
  createdAt: Date
}

export type QualityDomainRegion = z.infer<typeof QualityDomainRegionSchema>
export type QualityDomainPoint = z.infer<typeof QualityDomainPointSchema>

// Union type
export type QualityDomainProperty = z.infer<typeof QualityDomainPropertySchema>

// Type guards
export function isRegion(property: QualityDomainProperty): property is QualityDomainRegion {
  return property.type === 'region'
}

export function isPoint(property: QualityDomainProperty): property is QualityDomainPoint {
  return property.type === 'point'
}

export type QualityDomain = z.infer<typeof QualityDomainSchema>

export type PropertyReference = z.infer<typeof PropertyReferenceSchema>

export type Concept = z.infer<typeof ConceptSchema>

export type PointReference = z.infer<typeof PointReferenceSchema>

export type ConceptInstance = z.infer<typeof ConceptInstanceSchema>

// ===== Conceptual Structure =====

/**
 * ConceptualStructure represents the conceptual space definition for a word.
 * It mirrors the same structure as SceneState (domains, concepts, instances)
 * but without UI selection state or transient flags.
 */
export type ConceptualStructure = z.infer<typeof ConceptualStructureSchema>

// ===== Concepts Word Types =====

export type WordClass = z.infer<typeof WordClassSchema>

export const WORD_CLASS_LABELS: Record<WordClass, string> = {
  noun: 'Noun',
  adjective: 'Adjective',
  verb: 'Verb',
  adverb: 'Adverb',
  preposition: 'Preposition',
}

export const WORD_CLASSES: WordClass[] = ['noun', 'adjective', 'verb', 'adverb', 'preposition']

export type Word = z.infer<typeof WordSchema>

export type DictionaryWord = z.infer<typeof DictionaryWordSchema>

export type VerbType = z.infer<typeof VerbTypeSchema>

export const VERB_TYPE_LABELS: Record<VerbType, string> = {
  manner: 'Manner Verb',
  result: 'Result Verb',
}

export type Action = z.infer<typeof ActionSchema>

export interface QualityDomainState {
  domains: QualityDomain[]
  selectedDomainId: string | null
  selectedPropertyId: string | null
  selectedPropertyDomainId: string | null
  selectedConceptId: string | null
  selectedInstanceId: string | null
  concepts: Concept[]
  instances: ConceptInstance[]
}

export type QualityDomainAction =
  | { type: 'ADD_DOMAIN'; payload: QualityDomain }
  | { type: 'UPDATE_DOMAIN'; payload: QualityDomain }
  | { type: 'DELETE_DOMAIN'; payload: string }
  | { type: 'SELECT_DOMAIN'; payload: string | null }
  | { type: 'SELECT_PROPERTY'; payload: { domainId: string; propertyId: string } | null }
  | { type: 'SELECT_CONCEPT'; payload: string | null }
  | { type: 'SELECT_INSTANCE'; payload: string | null }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ADD_PROPERTY'; payload: { domainId: string; property: QualityDomainProperty } }
  | { type: 'UPDATE_PROPERTY'; payload: { domainId: string; property: QualityDomainProperty } }
  | { type: 'DELETE_PROPERTY'; payload: { domainId: string; propertyId: string } }
  | { type: 'ADD_CONCEPT'; payload: Concept }
  | { type: 'UPDATE_CONCEPT'; payload: Concept }
  | { type: 'DELETE_CONCEPT'; payload: string }
  | { type: 'ADD_INSTANCE'; payload: ConceptInstance }
  | { type: 'UPDATE_INSTANCE'; payload: ConceptInstance }
  | { type: 'DELETE_INSTANCE'; payload: string }
  | { type: 'RESTORE_STATE'; payload: { domains: QualityDomain[]; concepts: Concept[]; instances: ConceptInstance[] } }
