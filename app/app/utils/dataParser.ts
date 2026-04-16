/**
 * Data Parser Utilities
 * 
 * Centralized parsing and deserialization for quality domains, concepts, and instances.
 * Handles JSON import/export with proper type conversion and version migrations.
 * 
 * This module eliminates duplication across localStorage.ts, StateDebugPanel.tsx,
 * and ImportExportSection.tsx.
 */

import type {
  QualityDomain,
  Concept,
  ConceptInstance,
  ConceptualStructure,
  QualityDomainProperty,
  PropertyReference,
  DictionaryWord
} from '@/app/components/shared/types'

import type {
  JsonQualityDomain,
  JsonConcept,
  JsonConceptInstance,
  JsonConceptualStructure,
  JsonDictionaryWord,
  JsonQualityDimension,
  JsonPropertyDimension
} from '@/app/types/json'

/**
 * Convert string representations of Infinity to actual Infinity values
 */
export function convertInfinity(val: unknown): number {
  if (val === 'Infinity') return Infinity
  if (val === '-Infinity') return -Infinity
  return val as number
}

/**
 * Migration: Convert old label format to property format
 * Used when migrating from older versions that used "labels" terminology
 */
export function migrateLabelToProperty(oldLabel: any): QualityDomainProperty {
  return {
    type: oldLabel.type || 'region',
    id: oldLabel.id,
    name: oldLabel.name,
    domainId: oldLabel.domainId,
    dimensions: oldLabel.dimensions,
    createdAt: oldLabel.createdAt
  }
}

/**
 * Migration: Convert old LabelReference to PropertyReference
 * Used when migrating from older versions
 */
export function migrateLabelRefToPropertyRef(oldRef: any): PropertyReference {
  return {
    domainId: oldRef.domainId,
    propertyId: oldRef.propertyId || oldRef.propertyId
  }
}

/**
 * Parse quality domains from raw JSON data
 * 
 * Handles:
 * - Date deserialization
 * - Infinity value conversion
 * - Migration from old "labels" format to new "properties" format
 * - Both region and point property dimensions
 * 
 * @param rawDomains - Raw domain objects from JSON
 * @param version - Schema version number (for migrations)
 * @returns Parsed and typed QualityDomain array
 */
export function parseDomains(rawDomains: JsonQualityDomain[], version: number = 4): QualityDomain[] {
  return rawDomains.map((domain) => {
    const baseDomain = {
      ...domain,
      createdAt: new Date(domain.createdAt),
      dimensions: domain.dimensions.map((dim: JsonQualityDimension) => ({
        ...dim,
        range: [
          convertInfinity(dim.range[0]),
          convertInfinity(dim.range[1])
        ] as const
      }))
    }

    // Migrate old 'labels' field to 'properties' if needed
    const propertyList = domain.properties || (domain as any).labels || []
    
    const properties = propertyList.map((property: any) => ({
      ...property,
      createdAt: new Date(property.createdAt),
      dimensions: property.dimensions.map((d: JsonPropertyDimension) => {
        // Handle region dimensions (with range)
        if ('range' in d) {
          return {
            ...d,
            range: [
              convertInfinity(d.range[0]),
              convertInfinity(d.range[1])
            ] as const
          }
        }
        // Handle point dimensions (with value)
        return d
      })
    }))

    return {
      ...baseDomain,
      properties
    } as QualityDomain
  })
}

/**
 * Parse concepts from raw JSON data
 * 
 * Handles:
 * - Date deserialization
 * - Migration from old "propertyRefs" to new "propertyRefs"
 * 
 * @param rawConcepts - Raw concept objects from JSON
 * @param version - Schema version number (for migrations)
 * @returns Parsed and typed Concept array
 */
export function parseConcepts(rawConcepts: JsonConcept[], version: number = 4): Concept[] {
  return (rawConcepts || []).map((concept) => {
    // Migrate old 'labelRefs' with 'labelId' to 'propertyRefs' with 'propertyId'
    let propertyRefs = concept.propertyRefs
    if (!propertyRefs && (concept as any).labelRefs) {
      propertyRefs = ((concept as any).labelRefs || []).map((ref: any) => ({
        domainId: ref.domainId,
        propertyId: ref.labelId || ref.propertyId
      }))
    }

    return {
      ...concept,
      propertyRefs: propertyRefs || [],
      createdAt: new Date(concept.createdAt)
    }
  })
}

/**
 * Parse concept instances from raw JSON data
 * 
 * Handles:
 * - Date deserialization
 * 
 * @param rawInstances - Raw instance objects from JSON
 * @returns Parsed and typed ConceptInstance array
 */
export function parseInstances(rawInstances: JsonConceptInstance[]): ConceptInstance[] {
  return (rawInstances || []).map((instance) => ({
    ...instance,
    createdAt: new Date(instance.createdAt)
  }))
}

/**
 * Parse a complete conceptual structure from raw JSON data
 * 
 * A ConceptualStructure contains domains, concepts, and instances together.
 * This is the format used for word definitions in the library.
 * 
 * @param raw - Raw conceptual structure object from JSON (use unknown for initial parse)
 * @param version - Schema version number (for migrations, defaults to latest)
 * @returns Parsed and typed ConceptualStructure
 */
export function parseConceptualStructure(raw: unknown, version: number = 4): ConceptualStructure {
  if (!raw || typeof raw !== 'object') {
    return { domains: [], concepts: [], instances: [] }
  }
  
  const data = raw as JsonConceptualStructure
  return {
    domains: parseDomains(data.domains || [], version),
    concepts: parseConcepts(data.concepts || [], version),
    instances: parseInstances(data.instances || []),
  }
}

/**
 * Parse dictionary words from raw JSON data
 * 
 * Handles:
 * - Date deserialization
 * - Nested conceptual structure parsing
 * 
 * @param rawWords - Raw word objects from JSON
 * @returns Parsed and typed DictionaryWord array
 */
export function parseDictionaryWords(rawWords: JsonDictionaryWord[]): DictionaryWord[] {
  return (rawWords || []).map((word) => ({
    ...word,
    createdAt: new Date(word.createdAt),
  }))
}

/**
 * DataParser - Centralized parsing utilities
 * 
 * Provides a clean interface for importing/parsing JSON data across the application.
 * All parsing functions handle type conversion, date deserialization, and version migrations.
 */
export const DataParser = {
  convertInfinity,
  parseDomains,
  parseConcepts,
  parseInstances,
  parseConceptualStructure,
  parseDictionaryWords,
  // Migration utilities (exported for backward compatibility)
  migrateLabelToProperty,
  migrateLabelRefToPropertyRef,
} as const
