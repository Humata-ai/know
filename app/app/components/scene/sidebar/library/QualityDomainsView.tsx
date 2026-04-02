'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'
import LibraryListItem from './LibraryListItem'

export default function QualityDomainsView() {
  const router = useRouter()
  const { state } = useAppStore()

  if (state.library.domains.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No quality domains yet. Click + to add one.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {state.library.domains.map((domain) => {
        const labelCount = domain.labels.length
        const subtitle = `${domain.dimensions.length}D • ${labelCount} ${labelCount === 1 ? 'label' : 'labels'}`
        return (
          <LibraryListItem
            key={domain.id}
            title={domain.name}
            subtitle={subtitle}
            onClick={() => router.push(`/library/quality-domains/${domain.id}`)}
          />
        )
      })}
    </div>
  )
}
