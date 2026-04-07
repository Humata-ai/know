import type { DictionaryWord, Concept, QualityDomain } from '../shared/types'

/**
 * Resolve the display name for a dictionary word from its references.
 */
export function getDictionaryWordName(
  word: DictionaryWord,
  domains: QualityDomain[],
  concepts: Concept[],
): string {
  if (word.labelRef) {
    const domain = domains.find((d) => d.id === word.labelRef!.domainId)
    if (domain) {
      const label = domain.labels.find((l) => l.id === word.labelRef!.labelId)
      if (label) return label.name ?? '(unknown label)'
    }
    return '(unknown label)'
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
  if (word.labelRef) {
    const domain = domains.find((d) => d.id === word.labelRef!.domainId)
    return domain ? `Label in ${domain.name}` : 'Label'
  }
  if (word.conceptId) {
    return 'Concept'
  }
  return ''
}
