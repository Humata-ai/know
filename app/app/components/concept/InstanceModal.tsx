'use client'

import { useState, useEffect } from 'react'
import { useQualityDomain } from '@/app/store'
import type { ConceptInstance, PointReference, QualityDomain } from '../shared/types'
import { isPoint } from '../shared/types'
import { generateId } from '../shared/utils'
import Modal from '@/app/components/common/Modal'
import { required, collectErrors } from '@/app/utils/validators'

interface InstanceModalProps {
  isOpen: boolean
  conceptId: string | null
  editingInstanceId: string | null
  onClose: () => void
}

export default function InstanceModal({
  isOpen,
  conceptId,
  editingInstanceId,
  onClose,
}: InstanceModalProps) {
  const { state, addInstance, updateInstance, getConceptProperties } = useQualityDomain()
  const [name, setName] = useState('')
  const [selectedPoints, setSelectedPoints] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<string[]>([])

  const concept = conceptId ? state.scene.concepts.find((c) => c.id === conceptId) : null
  const editingInstance = editingInstanceId
    ? state.scene.instances.find((i) => i.id === editingInstanceId)
    : null

  // Get unique domains referenced by the concept
  const referencedDomains: QualityDomain[] = concept
    ? Array.from(new Set((concept.propertyRefs || []).map(ref => ref.domainId)))
        .map(domainId => state.scene.domains.find(d => d.id === domainId))
        .filter((d): d is QualityDomain => d !== undefined)
    : []

  useEffect(() => {
    if (isOpen && concept) {
      if (editingInstance) {
        setName(editingInstance.name)
        const pointMap: Record<string, string> = {}
        editingInstance.pointRefs.forEach(ref => {
          pointMap[ref.domainId] = ref.pointId
        })
        setSelectedPoints(pointMap)
      } else {
        setName('')
        setSelectedPoints({})
      }
      setErrors([])
    }
  }, [isOpen, concept, editingInstance])

  const handlePointSelection = (domainId: string, pointId: string) => {
    setSelectedPoints(prev => {
      if (pointId === '') {
        const newMap = { ...prev }
        delete newMap[domainId]
        return newMap
      }
      return { ...prev, [domainId]: pointId }
    })
  }

  const validate = (): boolean => {
    const newErrors: string[] = []
    
    if (!concept) {
      newErrors.push('Invalid concept')
      setErrors(newErrors)
      return false
    }

    const nameError = required('Instance name')(name)
    if (nameError) newErrors.push(nameError)

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !concept) {
      return
    }

    const pointRefs: PointReference[] = Object.entries(selectedPoints).map(
      ([domainId, pointId]) => ({
        domainId,
        pointId,
      })
    )

    const instance: ConceptInstance = {
      id: editingInstance?.id || generateId(),
      conceptId: concept.id,
      name,
      pointRefs,
      createdAt: editingInstance?.createdAt || new Date(),
    }

    if (editingInstance) {
      updateInstance(instance)
    } else {
      addInstance(instance)
    }

    onClose()
  }

  if (!isOpen || !concept) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingInstance ? 'Edit Instance' : 'Create Instance'}
    >
      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
        <div className="text-sm font-medium text-blue-900">
          Concept: {concept.name}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="instance-name" className="block text-sm font-medium mb-1">
                Instance Name
              </label>
              <input
                id="instance-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., Mary, Socrates, Object #42"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select Points from Each Domain
              </label>
              <div className="space-y-3">
                {referencedDomains.map((domain) => {
                  // Get only point labels from this domain
                  const availablePoints = domain.properties.filter(isPoint)

                  return (
                    <div key={domain.id} className="border border-gray-200 rounded p-3">
                      <div className="text-sm font-medium mb-2">{domain.name}</div>
                      {availablePoints.length === 0 ? (
                        <div className="text-xs text-gray-500 italic">
                          No points available in this domain
                        </div>
                      ) : (
                        <select
                          value={selectedPoints[domain.id] || ''}
                          onChange={(e) => handlePointSelection(domain.id, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">-- Optional: Skip this domain --</option>
                          {availablePoints.map((point) => (
                            <option key={point.id} value={point.id}>
                              {point.name}
                            </option>
                          ))}
                        </select>
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingInstance ? 'Update Instance' : 'Save Instance'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
