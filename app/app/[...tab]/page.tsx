'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'

const VALID_TABS = ['scene', 'library', 'import-export'] as const
const VALID_LIBRARY_SECTIONS = ['dictionary', 'concepts', 'quality-domains', 'quality-dimensions'] as const

export default function TabPage({ params }: { params: Promise<{ tab: string[] }> }) {
  const { tab } = use(params)
  const mainTab = tab[0]

  if (!VALID_TABS.includes(mainTab as typeof VALID_TABS[number])) {
    notFound()
  }

  // Handle library sub-routes: /library/concepts, /library/quality-domains, etc.
  if (mainTab === 'library' && tab.length > 1) {
    const section = tab[1]
    if (!VALID_LIBRARY_SECTIONS.includes(section as typeof VALID_LIBRARY_SECTIONS[number])) {
      notFound()
    }
    
    // Dictionary supports: /library/dictionary/<word-slug>
    if (section === 'dictionary') {
      if (tab.length > 3) {
        notFound()
      }
    } else if (section === 'concepts') {
      // Concepts supports deeper nesting: /library/concepts/<word> and /library/concepts/<word>/edit
      if (tab.length > 4) {
        notFound()
      }
      if (tab.length === 4 && tab[3] !== 'edit') {
        notFound()
      }
    } else if (section === 'quality-domains') {
      // Quality domains supports: /library/quality-domains/<domain-slug>
      if (tab.length > 3) {
        notFound()
      }
    } else {
      // No further nesting allowed for other sections
      if (tab.length > 2) {
        notFound()
      }
    }
  }

  // No sub-routes for non-library tabs
  if (mainTab !== 'library' && tab.length > 1) {
    notFound()
  }

  return null
}
