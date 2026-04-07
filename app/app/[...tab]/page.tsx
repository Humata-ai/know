'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'

const VALID_TABS = ['inspect', 'library', 'import-export'] as const
const VALID_LIBRARY_SECTIONS = ['dictionary', 'concepts', 'actions', 'quality-domains', 'quality-dimensions', 'properties'] as const

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
    
    // All sections support detail views: /library/<section>/<id>
    // Maximum depth is 3 for most sections (section + id)
    if (section === 'concepts') {
      // Concepts supports deeper nesting: /library/concepts/<word> and /library/concepts/<word>/edit (legacy)
      if (tab.length > 4) {
        notFound()
      }
      if (tab.length === 4 && tab[3] !== 'edit') {
        notFound()
      }
    } else {
      // All other sections support: /library/<section> and /library/<section>/<id>
      if (tab.length > 3) {
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
