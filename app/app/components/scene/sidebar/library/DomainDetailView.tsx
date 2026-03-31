'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/app/store'

export default function DomainDetailView({ domainSlug }: { domainSlug: string }) {
  const { state, selectLibraryItem, clearLibrarySelection } = useAppStore()

  const domain = state.library.domains.find(
    (d) => d.name.toLowerCase().replace(/\s+/g, '-') === domainSlug
  )

  // Auto-select domain for 3D visualization when detail page is open
  useEffect(() => {
    if (domain) {
      selectLibraryItem(domain.id, 'quality-domain')
    }
    return () => {
      clearLibrarySelection()
    }
  }, [domain, selectLibraryItem, clearLibrarySelection])

  if (!domain) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Domain not found.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {domain.dimensions.length}D
        </span>
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {domain.labels.length} {domain.labels.length === 1 ? 'label' : 'labels'}
        </span>
      </div>

      {domain.dimensions.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Dimensions</h4>
          <div className="space-y-1">
            {domain.dimensions.map((dim) => (
              <div key={dim.id} className="text-sm text-gray-700 flex items-center justify-between">
                <span>{dim.name}</span>
                <span className="text-xs text-gray-400">[{dim.range[0]}, {dim.range[1]}]</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {domain.labels.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Labels</h4>
          <div className="space-y-1">
            {domain.labels.map((label) => (
              <div key={label.id} className="text-sm text-gray-700">
                {label.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
