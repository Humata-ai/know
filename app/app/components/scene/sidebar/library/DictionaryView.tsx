'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'
import { getDictionaryWordName, getDictionaryWordType } from '../../../dictionary/utils'

export default function DictionaryView() {
  const router = useRouter()
  const { state } = useAppStore()

  if (state.library.dictionaryWords.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No words registered yet. Click + to add one.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {state.library.dictionaryWords.map((word) => {
        const pointerName = getDictionaryWordName(word, state.library.domains, state.library.concepts)
        const typeLabel = getDictionaryWordType(word, state.library.domains)
        return (
          <button
            key={word.id}
            onClick={() => router.push(`/library/dictionary/${encodeURIComponent(word.id)}`)}
            className="w-full p-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors text-left"
          >
            <h3 className="font-medium">{word.name}</h3>
            <span className="text-xs text-gray-500">
              {typeLabel}: {pointerName}
            </span>
          </button>
        )
      })}
    </div>
  )
}
