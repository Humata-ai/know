export type SidebarView = 'scene' | 'import-export' | 'library'

export type LibrarySection = 'concepts' | 'quality-domains' | 'quality-dimensions'

export const VALID_TABS: SidebarView[] = ['scene', 'import-export', 'library']

export const VALID_LIBRARY_SECTIONS: LibrarySection[] = ['concepts', 'quality-domains', 'quality-dimensions']

export const LIBRARY_SECTION_LABELS: Record<LibrarySection, string> = {
  'concepts': 'Concepts',
  'quality-domains': 'Quality Domains',
  'quality-dimensions': 'Quality Dimensions',
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
  domainSlug: string
}

export function getQualityDomainFromPathname(pathname: string): QualityDomainRoute | null {
  const segments = pathname.replace(/^\//, '').split('/')
  // /library/quality-domains/<domain-slug>
  if (segments[0] === 'library' && segments[1] === 'quality-domains' && segments.length >= 3 && segments[2]) {
    return {
      domainSlug: decodeURIComponent(segments[2]),
    }
  }
  return null
}
