'use client'

import { useState, useEffect } from 'react'
import type { Concept, LabelReference, QualityDomain } from '../shared/types'
import { generateId } from '../shared/utils'
import Modal from '@/app/components/common/Modal'
import { required, arrayMinLength } from '@/app/utils/validators'

interface ConceptModalProps {
  isOpen: boolean
  editingConceptId: string | null
  onClose: () => void
  /** The domains to select labels from */
  domains: QualityDomain[]
  /** The concepts list (used to find the editing concept) */
  concepts: Concept[]
  /** Called when a new concept is created */
  onAddConcept: (concept: Concept) => void
  /** Called when an existing concept is updated */
  onUpdateConcept: (concept: Concept) => void
}

export default function ConceptModal({
  isOpen,
  editingConceptId,
  onClose,
  domains,
  concepts,
  onAddConcept,
  onUpdateConcept,
}: ConceptModalProps) {
  const [name, setName] = useState('')
  const [selectedLabelRefs, setSelectedLabelRefs] = useState<LabelReference[]>([])
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<string[]>([])

  const editingConcept = editingConceptId
    ? concepts.find((c) => c.id === editingConceptId)
    : null

  useEffect(() => {
    if (isOpen) {
      if (editingConcept) {
        setName(editingConcept.name)
        setSelectedLabelRefs(editingConcept.labelRefs)
      } else {
        setName('')
        setSelectedLabelRefs([])
      }
      // Expand all domains by default
      setExpandedDomains(new Set(domains.map(d => d.id)))
      setErrors([])
    }
  }, [isOpen, editingConcept, domains])

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(domainId)) {
        newSet.delete(domainId)
      } else {
        newSet.add(domainId)
      }
      return newSet
    })
  }

  const isLabelSelected = (domainId: string, labelId: string): boolean => {
    return selectedLabelRefs.some(
      (ref) => ref.domainId === domainId && ref.labelId === labelId
    )
  }

  const toggleLabel = (domainId: string, labelId: string) => {
    setSelectedLabelRefs((prev) => {
      const exists = prev.some(
        (ref) => ref.domainId === domainId && ref.labelId === labelId
      )
      if (exists) {
        return prev.filter(
          (ref) => !(ref.domainId === domainId && ref.labelId === labelId)
        )
      } else {
        return [...prev, { domainId, labelId }]
      }
    })
  }

  const getSelectedCount = (domainId: string): number => {
    return selectedLabelRefs.filter((ref) => ref.domainId === domainId).length
  }

  const validate = (): boolean => {
    const newErrors: string[] = []
    
    const nameError = required('Concept name')(name)
    if (nameError) newErrors.push(nameError)
    
    const labelsError = arrayMinLength('label', 1)(selectedLabelRefs)
    if (labelsError) newErrors.push(labelsError)

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const concept: Concept = {
      id: editingConcept?.id || generateId(),
      name,
      labelRefs: selectedLabelRefs,
      createdAt: editingConcept?.createdAt || new Date(),
    }

    if (editingConcept) {
      onUpdateConcept(concept)
    } else {
      onAddConcept(concept)
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingConcept ? 'Edit Concept' : 'Create Concept'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="concept-name" className="block text-sm font-medium mb-1">
                Concept Name
              </label>
              <input
                id="concept-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="e.g., Apple, Car, House"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select Labels
              </label>
              <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded p-2">
                {domains.map((domain) => {
                  const isExpanded = expandedDomains.has(domain.id)
                  const selectedCount = getSelectedCount(domain.id)
                  const totalCount = domain.labels.length

                  return (
                    <div key={domain.id} className="border border-gray-200 rounded">
                      <button
                        type="button"
                        onClick={() => toggleDomain(domain.id)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
                      >
                        <span className="font-medium text-sm">
                          {domain.name}
                          <span className="ml-2 text-xs text-gray-500">
                            ({selectedCount}/{totalCount} selected)
                          </span>
                        </span>
                        <span className="text-gray-500">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="p-2 space-y-1 border-t border-gray-200">
                          {domain.labels.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">No labels in this domain</p>
                          ) : (
                            domain.labels.map((label) => (
                              <label
                                key={label.id}
                                className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isLabelSelected(domain.id, label.id)}
                                  onChange={() => toggleLabel(domain.id, label.id)}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm">{label.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
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
            {editingConcept ? 'Update Concept' : 'Save Concept'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
