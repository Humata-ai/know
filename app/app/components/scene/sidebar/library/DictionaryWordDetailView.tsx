'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'
import { getDictionaryWordType } from '../../../dictionary/utils'

export default function DictionaryWordDetailView({ wordId }: { wordId: string }) {
  const { state, deleteDictionaryWord } = useAppStore()
  const router = useRouter()

  const word = state.library.dictionaryWords.find((w) => w.id === wordId)

  if (!word) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Word not found.</p>
      </div>
    )
  }

  const typeLabel = getDictionaryWordType(word, state.library.domains)

  const linkedConcept = word.conceptId
    ? state.library.concepts.find((c) => c.id === word.conceptId)
    : null

  const linkedLabel = word.labelRef
    ? (() => {
        const domain = state.library.domains.find((d) => d.id === word.labelRef!.domainId)
        if (!domain) return null
        const label = domain.labels.find((l) => l.id === word.labelRef!.labelId)
        return label ? { label, domain } : null
      })()
    : null

  const handleDelete = () => {
    deleteDictionaryWord(word.id)
    router.push('/library/dictionary')
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {typeLabel}
        </span>
      </div>

      {linkedLabel && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Label</h4>
          <p className="text-sm text-gray-700">{linkedLabel.label.name || '(unnamed)'}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            in {linkedLabel.domain.name}
          </p>
        </div>
      )}

      {linkedConcept && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Concept</h4>
          <p className="text-sm text-gray-700">{linkedConcept.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {linkedConcept.labelRefs.length} {linkedConcept.labelRefs.length === 1 ? 'label' : 'labels'}
          </p>
        </div>
      )}

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Added</h4>
        <p className="text-sm text-gray-700">{word.createdAt.toLocaleDateString()}</p>
      </div>

      <div className="pt-2">
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Remove from dictionary
        </button>
      </div>
    </div>
  )
}
