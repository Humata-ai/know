'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'
import LibraryListItem from './LibraryListItem'

export default function ActionsView() {
  const router = useRouter()
  const { state } = useAppStore()

  if (!state.library.actions || state.library.actions.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No actions yet. Click + to add one.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {state.library.actions.map((action) => {
        let verbTypeLabel = ''
        if (action.verbType === 'manner') verbTypeLabel = 'Manner Verb'
        else if (action.verbType === 'result') verbTypeLabel = 'Result Verb'

        return (
          <LibraryListItem
            key={action.id}
            title={action.name}
            subtitle={verbTypeLabel}
            onClick={() => router.push(`/library/actions/${encodeURIComponent(action.id)}`)}
          />
        )
      })}
    </div>
  )
}
