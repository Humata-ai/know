import type { DictionaryWord, Concept, QualityDomain } from '../shared/types'

/**
 * Resolve the display name for a dictionary word from its references.
 */
export function getDictionaryWordName(
  word: DictionaryWord,
  domains: QualityDomain[],
  concepts: Concept[],
): string {
  if (word.propertyRef) {
    const domain = domains.find((d) => d.id === word.propertyRef!.domainId)
    if (domain) {
      const property = domain.properties.find((l) => l.id === word.propertyRef!.propertyId)
      if (property) return property.name ?? '(unknown property)'
    }
    return '(unknown property)'
  }
  if (word.conceptId) {
    const concept = concepts.find((c) => c.id === word.conceptId)
    if (concept) return concept.name ?? '(unknown concept)'
    return '(unknown concept)'
  }
  return '(unlinked)'
}

/**
 * Get a description of what the dictionary word points to.
 */
export function getDictionaryWordType(
  word: DictionaryWord,
  domains: QualityDomain[],
): string {
  if (word.propertyRef) {
    const domain = domains.find((d) => d.id === word.propertyRef!.domainId)
    return domain ? `Property in ${domain.name}` : 'Property'
  }
  if (word.conceptId) {
    return 'Concept'
  }
  return ''
}
