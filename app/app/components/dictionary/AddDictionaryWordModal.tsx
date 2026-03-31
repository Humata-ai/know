'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/app/store'
import { generateId } from '../shared/utils'
import type { LabelReference } from '../shared/types'
import Modal from '@/app/components/common/Modal'

type RefType = 'label' | 'concept'

interface AddDictionaryWordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddDictionaryWordModal({ isOpen, onClose }: AddDictionaryWordModalProps) {
  const { state, addDictionaryWord } = useAppStore()
  const [name, setName] = useState('')
  const [refType, setRefType] = useState<RefType>('label')
  const [selectedLabelRef, setSelectedLabelRef] = useState<LabelReference | null>(null)
  const [selectedConceptId, setSelectedConceptId] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      setName('')
      setRefType('label')
      setSelectedLabelRef(null)
      setSelectedConceptId('')
      setErrors([])
    }
  }, [isOpen])

  // Collect all labels across all library domains
  const allLabels = state.library.domains.flatMap((domain) =>
    domain.labels.map((label) => ({
      domainId: domain.id,
      domainName: domain.name,
      labelId: label.id,
      labelName: label.name,
    }))
  )

  const libraryConcepts = state.library.concepts

  const validate = (): boolean => {
    const newErrors: string[] = []

    if (!name.trim()) {
      newErrors.push('Word name is required')
    }

    // Check for duplicate names
    if (name.trim()) {
      const nameExists = state.library.dictionaryWords.some(
        (w) => w.name.toLowerCase() === name.trim().toLowerCase()
      )
      if (nameExists) {
        newErrors.push('A word with this name already exists in the dictionary')
      }
    }

    if (refType === 'label' && !selectedLabelRef) {
      newErrors.push('Select a label')
    }
    if (refType === 'concept' && !selectedConceptId) {
      newErrors.push('Select a concept')
    }

    // Check for duplicate refs
    if (refType === 'label' && selectedLabelRef) {
      const exists = state.library.dictionaryWords.some(
        (w) =>
          w.labelRef?.domainId === selectedLabelRef.domainId &&
          w.labelRef?.labelId === selectedLabelRef.labelId
      )
      if (exists) {
        newErrors.push('This label is already in the dictionary')
      }
    }
    if (refType === 'concept' && selectedConceptId) {
      const exists = state.library.dictionaryWords.some(
        (w) => w.conceptId === selectedConceptId
      )
      if (exists) {
        newErrors.push('This concept is already in the dictionary')
      }
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
      labelRef: refType === 'label' && selectedLabelRef ? selectedLabelRef : undefined,
      conceptId: refType === 'concept' && selectedConceptId ? selectedConceptId : undefined,
      createdAt: new Date(),
    })

    onClose()
  }

  const handleLabelSelect = (domainId: string, labelId: string) => {
    setSelectedLabelRef({ domainId, labelId })
  }

  const hasLabels = allLabels.length > 0
  const hasConcepts = libraryConcepts.length > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Dictionary" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Word name */}
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

        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Points to</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRefType('label')
                setSelectedConceptId('')
              }}
              className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                refType === 'label'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Label
            </button>
            <button
              type="button"
              onClick={() => {
                setRefType('concept')
                setSelectedLabelRef(null)
              }}
              className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                refType === 'concept'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Concept
            </button>
          </div>
        </div>

        {/* Label picker */}
        {refType === 'label' && (
          <div>
            <label className="block text-sm font-medium mb-2">Select Label</label>
            {!hasLabels ? (
              <p className="text-sm text-gray-500">No labels available. Add labels to quality domains first.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded p-2">
                {state.library.domains.map((domain) => {
                  if (domain.labels.length === 0) return null
                  return (
                    <div key={domain.id}>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        {domain.name}
                      </p>
                      <div className="space-y-1">
                        {domain.labels.map((label) => {
                          const isSelected =
                            selectedLabelRef?.domainId === domain.id &&
                            selectedLabelRef?.labelId === label.id
                          return (
                            <button
                              key={label.id}
                              type="button"
                              onClick={() => handleLabelSelect(domain.id, label.id)}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                isSelected
                                  ? 'bg-purple-100 border border-purple-300 text-purple-800'
                                  : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              {label.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Concept picker */}
        {refType === 'concept' && (
          <div>
            <label htmlFor="dict-concept" className="block text-sm font-medium mb-2">
              Select Concept
            </label>
            {!hasConcepts ? (
              <p className="text-sm text-gray-500">No concepts available. Add concepts first.</p>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto border border-gray-200 rounded p-2">
                {libraryConcepts.map((concept) => {
                  const isSelected = selectedConceptId === concept.id
                  return (
                    <button
                      key={concept.id}
                      type="button"
                      onClick={() => setSelectedConceptId(concept.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        isSelected
                          ? 'bg-purple-100 border border-purple-300 text-purple-800'
                          : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{concept.name}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {concept.labelRefs.length} {concept.labelRefs.length === 1 ? 'label' : 'labels'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
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
