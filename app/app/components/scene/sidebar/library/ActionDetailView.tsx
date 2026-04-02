'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'

export default function ActionDetailView({ actionId }: { actionId: string }) {
  const { state, deleteLibraryAction } = useAppStore()
  const router = useRouter()

  const action = state.library.actions?.find((a) => a.id === actionId)

  if (!action) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Action not found.</p>
      </div>
    )
  }

  let verbTypeLabel = ''
  if (action.verbType === 'manner') verbTypeLabel = 'Manner Verb'
  else if (action.verbType === 'result') verbTypeLabel = 'Result Verb'
  else if (action.verbType === 'path') verbTypeLabel = 'Path Verb'

  const handleDelete = () => {
    deleteLibraryAction(action.id)
    router.push('/library/actions')
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {verbTypeLabel}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Verb Type</h4>
        <p className="text-sm text-gray-700">{action.verbType}</p>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Added</h4>
        <p className="text-sm text-gray-700">{action.createdAt.toLocaleDateString()}</p>
      </div>

      <div className="pt-2">
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Delete action
        </button>
      </div>
    </div>
  )
}
