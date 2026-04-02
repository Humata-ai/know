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
  QualityDomainLabel,
  Property,
  PropertyReference,
  LabelReference,
  DictionaryWord
} from '@/app/components/shared/types'

/**
 * Convert string representations of Infinity to actual Infinity values
 */
export function convertInfinity(val: unknown): number {
  if (val === 'Infinity') return Infinity
  if (val === '-Infinity') return -Infinity
  return val as number
}

/**
 * Migration: Convert old Property to QualityDomainLabel (Region)
 * Used when migrating from version 1 format
 */
export function migratePropertyToLabel(oldProperty: Property): QualityDomainLabel {
  return {
    type: 'region',
    id: oldProperty.id,
    name: oldProperty.name,
    domainId: oldProperty.domainId,
    dimensions: oldProperty.dimensions,
    createdAt: oldProperty.createdAt
  }
}

/**
 * Migration: Convert old PropertyReference to LabelReference
 * Used when migrating from version 1 format
 */
export function migratePropertyRefToLabelRef(oldRef: PropertyReference): LabelReference {
  return {
    domainId: oldRef.domainId,
    labelId: oldRef.propertyId
  }
}

/**
 * Parse quality domains from raw JSON data
 * 
 * Handles:
 * - Date deserialization
 * - Infinity value conversion
 * - Migration from old "properties" format to new "labels" format
 * - Both region and point label dimensions
 * 
 * @param rawDomains - Raw domain objects from JSON
 * @param version - Schema version number (for migrations)
 * @returns Parsed and typed QualityDomain array
 */
export function parseDomains(rawDomains: any[], version: number = 4): QualityDomain[] {
  return rawDomains.map((domain: any) => {
    const baseDomain = {
      ...domain,
      createdAt: new Date(domain.createdAt),
      dimensions: domain.dimensions.map((dim: any) => ({
        ...dim,
        range: [
          convertInfinity(dim.range[0]),
          convertInfinity(dim.range[1])
        ] as const
      }))
    }

    // Handle old format (version 1) with properties field
    if (version === 1 || domain.properties) {
      const oldProperties = (domain.properties || []).map((prop: any) => ({
        ...prop,
        createdAt: new Date(prop.createdAt),
        dimensions: prop.dimensions.map((d: any) => ({
          ...d,
          range: [
            convertInfinity(d.range[0]),
            convertInfinity(d.range[1])
          ] as const
        }))
      }))

      // Migrate old properties to labels
      return {
        ...baseDomain,
        labels: oldProperties.map(migratePropertyToLabel)
      }
    }

    // Handle new format (version 2+) with labels field
    const labels = (domain.labels || []).map((label: any) => ({
      ...label,
      createdAt: new Date(label.createdAt),
      dimensions: label.dimensions.map((d: any) => {
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
      labels
    }
  })
}

/**
 * Parse concepts from raw JSON data
 * 
 * Handles:
 * - Date deserialization
 * - Migration from old "propertyRefs" to new "labelRefs"
 * 
 * @param rawConcepts - Raw concept objects from JSON
 * @param version - Schema version number (for migrations)
 * @returns Parsed and typed Concept array
 */
export function parseConcepts(rawConcepts: any[], version: number = 4): Concept[] {
  return (rawConcepts || []).map((concept: any) => {
    const baseConcept = {
      ...concept,
      createdAt: new Date(concept.createdAt)
    }

    // Handle old format with propertyRefs
    if (version === 1 || concept.propertyRefs) {
      return {
        ...baseConcept,
        labelRefs: (concept.propertyRefs || []).map(migratePropertyRefToLabelRef)
      }
    }

    // New format already has labelRefs
    return baseConcept
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
export function parseInstances(rawInstances: any[]): ConceptInstance[] {
  return (rawInstances || []).map((instance: any) => ({
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
 * @param raw - Raw conceptual structure object from JSON
 * @param version - Schema version number (for migrations, defaults to latest)
 * @returns Parsed and typed ConceptualStructure
 */
export function parseConceptualStructure(raw: any, version: number = 4): ConceptualStructure {
  if (!raw) {
    return { domains: [], concepts: [], instances: [] }
  }
  return {
    domains: parseDomains(raw.domains || [], version),
    concepts: parseConcepts(raw.concepts || [], version),
    instances: parseInstances(raw.instances || []),
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
export function parseDictionaryWords(rawWords: any[]): DictionaryWord[] {
  return (rawWords || []).map((word: any) => ({
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
  migratePropertyToLabel,
  migratePropertyRefToLabelRef,
} as const
