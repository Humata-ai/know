'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'
import LibraryListItem from './LibraryListItem'

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
        const labelCount = concept.labelRefs.length
        return (
          <LibraryListItem
            key={concept.id}
            title={concept.name}
            subtitle={`${labelCount} ${labelCount === 1 ? 'label' : 'labels'}`}
            onClick={() => router.push(`/library/concepts/${encodeURIComponent(concept.id)}`)}
          />
        )
      })}
    </div>
  )
}
