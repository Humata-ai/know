'use client'

import { useAppStore } from '@/app/store'

interface ConceptDetailViewProps {
  conceptId: string
  onDelete?: () => void
}

export default function ConceptDetailView({ conceptId, onDelete }: ConceptDetailViewProps) {
  const { state } = useAppStore()

  const concept = state.library.concepts.find((c) => c.id === conceptId)

  if (!concept) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Concept not found.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {concept.labelRefs.length} {concept.labelRefs.length === 1 ? 'label' : 'labels'}
        </span>
      </div>

      {concept.labelRefs.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Labels</h4>
          <div className="space-y-2">
            {concept.labelRefs.map((labelRef, index) => {
              const domain = state.library.domains.find(d => d.id === labelRef.domainId)
              const label = domain?.labels.find(l => l.id === labelRef.labelId)
              if (!domain || !label) return null
              
              return (
                <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                  <div className="font-medium">{label.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">in {domain.name}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
