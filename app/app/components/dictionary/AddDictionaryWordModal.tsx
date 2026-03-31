'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/app/store'
import { generateId } from '../shared/utils'
import Modal from '@/app/components/common/Modal'

interface AddDictionaryWordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddDictionaryWordModal({ isOpen, onClose }: AddDictionaryWordModalProps) {
  const { state, addDictionaryWord } = useAppStore()
  const [name, setName] = useState('')
  const [conceptId, setConceptId] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      setName('')
      setConceptId('')
      setErrors([])
    }
  }, [isOpen])

  const validate = (): boolean => {
    const newErrors: string[] = []
    if (!name.trim()) {
      newErrors.push('Word name is required')
    }
    // Check for duplicate word names
    const exists = state.library.dictionaryWords.some(
      (w) => w.name.toLowerCase() === name.trim().toLowerCase()
    )
    if (exists) {
      newErrors.push('A word with this name already exists in the dictionary')
    }
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    addDictionaryWord({
      id: generateId(),
      name: name.trim(),
      conceptId: conceptId || undefined,
      createdAt: new Date(),
    })

    onClose()
  }

  const libraryConcepts = state.library.concepts

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Word to Dictionary" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="dict-word-name" className="block text-sm font-medium mb-1">
            Word
          </label>
          <input
            id="dict-word-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="e.g., Apple, Run, Beautiful"
            autoFocus
          />
        </div>

        {libraryConcepts.length > 0 && (
          <div>
            <label htmlFor="dict-concept" className="block text-sm font-medium mb-1">
              Associate with Concept <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              id="dict-concept"
              value={conceptId}
              onChange={(e) => setConceptId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">None</option>
              {libraryConcepts.map((concept) => (
                <option key={concept.id} value={concept.id}>
                  {concept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <ul className="text-sm text-red-800 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
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
            Add to Dictionary
          </button>
        </div>
      </form>
    </Modal>
  )
}
