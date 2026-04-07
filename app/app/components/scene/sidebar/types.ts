export type SidebarView = 'inspect' | 'import-export' | 'library'

export type LibrarySection = 'dictionary' | 'concepts' | 'actions' | 'quality-domains' | 'quality-dimensions' | 'properties'

export const VALID_TABS: SidebarView[] = ['inspect', 'import-export', 'library']

export const VALID_LIBRARY_SECTIONS: LibrarySection[] = ['dictionary', 'concepts', 'actions', 'quality-domains', 'quality-dimensions', 'properties']

export const LIBRARY_SECTION_LABELS: Record<LibrarySection, string> = {
  'dictionary': 'Dictionary',
  'concepts': 'Concepts',
  'actions': 'Actions',
  'quality-domains': 'Quality Domains',
  'quality-dimensions': 'Quality Dimensions',
  'properties': 'Properties',
}

export function getTabFromPathname(pathname: string): SidebarView | null {
  const segment = pathname.replace(/^\//, '').split('/')[0]
  if (VALID_TABS.includes(segment as SidebarView)) {
    return segment as SidebarView
  }
  return null
}

export function getLibrarySectionFromPathname(pathname: string): LibrarySection | null {
  const segments = pathname.replace(/^\//, '').split('/')
  if (segments[0] === 'library' && segments.length > 1) {
    const section = segments[1]
    if (VALID_LIBRARY_SECTIONS.includes(section as LibrarySection)) {
      return section as LibrarySection
    }
  }
  return null
}

// Generic interface for library detail routes
export interface LibraryDetailRoute {
  section: LibrarySection
  itemId: string
}

// Get library detail route from pathname
// Supports: /library/<section>/<id>
export function getLibraryDetailFromPathname(pathname: string): LibraryDetailRoute | null {
  const segments = pathname.replace(/^\//, '').split('/')
  // /library/<section>/<id>
  if (segments[0] === 'library' && segments.length >= 3 && segments[2]) {
    const section = segments[1]
    if (VALID_LIBRARY_SECTIONS.includes(section as LibrarySection)) {
      return {
        section: section as LibrarySection,
        itemId: decodeURIComponent(segments[2]),
      }
    }
  }
  return null
}

// Legacy route helpers for backward compatibility
export interface DictionaryWordRoute {
  wordSlug: string
  isEdit: boolean
}

export function getDictionaryWordFromPathname(pathname: string): DictionaryWordRoute | null {
  const segments = pathname.replace(/^\//, '').split('/')
  // /library/dictionary/<word-slug> or /library/dictionary/<word-slug>/edit
  if (segments[0] === 'library' && segments[1] === 'dictionary' && segments.length >= 3 && segments[2]) {
    return {
      wordSlug: decodeURIComponent(segments[2]),
      isEdit: segments[3] === 'edit',
    }
  }
  return null
}

export interface ConceptsWordRoute {
  wordSlug: string
  isEdit: boolean
}

export function getConceptsWordFromPathname(pathname: string): ConceptsWordRoute | null {
  const segments = pathname.replace(/^\//, '').split('/')
  // /library/concepts/<word-slug> or /library/concepts/<word-slug>/edit
  if (segments[0] === 'library' && segments[1] === 'concepts' && segments.length >= 3 && segments[2]) {
    return {
      wordSlug: decodeURIComponent(segments[2]),
      isEdit: segments[3] === 'edit',
    }
  }
  return null
}

export interface QualityDomainRoute {
  domainId: string
}

export function getQualityDomainFromPathname(pathname: string): QualityDomainRoute | null {
  const segments = pathname.replace(/^\//, '').split('/')
  // /library/quality-domains/<domain-id>
  if (segments[0] === 'library' && segments[1] === 'quality-domains' && segments.length >= 3 && segments[2]) {
    return {
      domainId: decodeURIComponent(segments[2]),
    }
  }
  return null
}
