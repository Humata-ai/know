'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'

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
        const slug = domain.name.toLowerCase().replace(/\s+/g, '-')
        return (
          <button
            key={domain.id}
            onClick={() => router.push(`/library/quality-domains/${encodeURIComponent(slug)}`)}
            className="w-full p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="font-medium">{domain.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {domain.dimensions.length}D
              </span>
              <span className="text-xs text-gray-500">
                {domain.labels.length} {domain.labels.length === 1 ? 'label' : 'labels'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
