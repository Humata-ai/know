'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'
import { generateId } from '../shared/utils'
import { WORD_CLASSES, WORD_CLASS_LABELS } from '../shared/types'
import type { WordClass } from '../shared/types'
import Modal from '@/app/components/common/Modal'

interface AddWordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddWordModal({ isOpen, onClose }: AddWordModalProps) {
  const router = useRouter()
  const { addWord } = useAppStore()
  const [name, setName] = useState('')
  const [wordClass, setWordClass] = useState<WordClass>('noun')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      setName('')
      setWordClass('noun')
      setErrors([])
    }
  }, [isOpen])

  const validate = (): boolean => {
    const newErrors: string[] = []
    if (!name.trim()) {
      newErrors.push('Word name is required')
    }
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-')

    addWord({
      id: generateId(),
      name: name.trim(),
      wordClass,
      conceptualStructure: { domains: [], concepts: [], instances: [] },
      createdAt: new Date(),
    })

    onClose()
    router.push(`/library/concepts/${encodeURIComponent(slug)}/edit`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Word" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="word-name" className="block text-sm font-medium mb-1">
            Word Name
          </label>
          <input
            id="word-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="e.g., Follow, Run, Beautiful"
            autoFocus
          />
        </div>

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

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <ul className="text-sm text-red-800 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  )
}
