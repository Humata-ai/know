'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'

export default function ConceptsView() {
  const router = useRouter()
  const { state } = useAppStore()

  if (state.library.concepts.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No concepts yet. Click + to add one.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {state.library.concepts.map((concept) => {
        return (
          <div
            key={concept.id}
            onClick={() => router.push(`/library/concepts/${encodeURIComponent(concept.id)}`)}
            className="w-full p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <h3 className="font-medium">{concept.name}</h3>
            <span className="text-xs text-gray-500">
              {concept.labelRefs.length} {concept.labelRefs.length === 1 ? 'label' : 'labels'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
