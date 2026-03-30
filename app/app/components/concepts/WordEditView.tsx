'use client'

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'
import { WORD_CLASSES, WORD_CLASS_LABELS } from '../shared/types'
import type { WordClass } from '../shared/types'

export interface WordEditViewHandle {
  save: () => void
}

interface WordEditViewProps {
  wordSlug: string
}

const WordEditView = forwardRef<WordEditViewHandle, WordEditViewProps>(function WordEditView({ wordSlug }, ref) {
  const router = useRouter()
  const { state, updateWord } = useAppStore()

  const word = state.library.words.find(
    (w) => w.name.toLowerCase().replace(/\s+/g, '-') === wordSlug
  )

  const [definition, setDefinition] = useState('')
  const [wordClass, setWordClass] = useState<WordClass>('noun')

  useEffect(() => {
    if (word) {
      setDefinition(word.definition)
      setWordClass(word.wordClass)
    }
  }, [word])

  if (!word) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Word not found.</p>
      </div>
    )
  }

  const handleSave = () => {
    updateWord({
      ...word,
      definition,
      wordClass,
    })
    router.push(`/library/concepts/${encodeURIComponent(wordSlug)}`)
  }

  useImperativeHandle(ref, () => ({
    save: handleSave,
  }))

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Word Class
        </label>
        <div className="flex flex-wrap gap-2">
          {WORD_CLASSES.map((wc) => (
            <button
              key={wc}
              type="button"
              onClick={() => setWordClass(wc)}
              className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                wordClass === wc
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {WORD_CLASS_LABELS[wc]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="word-definition" className="block text-sm font-medium mb-1">
          Definition
        </label>
        <textarea
          id="word-definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[120px] resize-y"
          placeholder="Enter the definition of this word..."
        />
      </div>
    </div>
  )
})

export default WordEditView
