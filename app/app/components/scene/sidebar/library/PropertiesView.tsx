'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'
import { isRegion } from '../../../shared/types'
import LibraryListItem from './LibraryListItem'

export default function PropertiesView() {
  const router = useRouter()
  const { state } = useAppStore()

  // Collect all labels across all library domains
  const allProperties = useMemo(() => {
    return state.library.domains.flatMap((domain) =>
      domain.labels.map((label) => ({
        label,
        domain,
      }))
    )
  }, [state.library.domains])

  if (allProperties.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No properties yet. Click + to add one.</p>
        <p className="text-xs mt-1">Properties are region labels on quality domains.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {allProperties.map(({ label, domain }) => {
        const typeLabel = isRegion(label) ? 'Region' : 'Point'
        const subtitle = `${domain.name} • ${typeLabel}`
        
        return (
          <LibraryListItem
            key={label.id}
            title={label.name || '(unnamed)'}
            subtitle={subtitle}
            onClick={() => router.push(`/library/properties/${encodeURIComponent(label.id)}`)}
          />
        )
      })}
    </div>
  )
}
