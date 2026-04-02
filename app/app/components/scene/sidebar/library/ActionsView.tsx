'use client'

import { useAppStore } from '@/app/store'

export default function ActionsView() {
  const { state, deleteLibraryAction } = useAppStore()

  if (!state.library.actions || state.library.actions.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No actions yet. Click + to add one.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {state.library.actions.map((action) => (
        <div
          key={action.id}
          className="p-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{action.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                  {action.verbType === 'manner' && 'Manner Verb'}
                  {action.verbType === 'result' && 'Result Verb'}
                  {action.verbType === 'path' && 'Path Verb'}
                </span>
              </div>
            </div>
            <button
              onClick={() => deleteLibraryAction(action.id)}
              className="text-xs text-red-500 hover:text-red-700 ml-2 mt-1"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
