'use client'

import { useAppStore } from '@/app/store'
import { WORD_CLASS_LABELS } from '../shared/types'

interface WordDetailViewProps {
  wordSlug: string
}

export default function WordDetailView({ wordSlug }: WordDetailViewProps) {
  const { state } = useAppStore()

  const word = state.library.words.find(
    (w) => w.name.toLowerCase().replace(/\s+/g, '-') === wordSlug
  )

  if (!word) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Word not found.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {WORD_CLASS_LABELS[word.wordClass]}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-1">Definition</h4>
        <p className="text-sm text-gray-800">
          {word.definition || <span className="italic text-gray-400">No definition yet.</span>}
        </p>
      </div>
    </div>
  )
}
