'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/app/store'
import { isRegion } from '../../../shared/types'
import LabelModal from '../../../quality-domain/LabelModal'

export default function PropertiesView() {
  const { state, deleteLibraryLabel } = useAppStore()
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Collect all labels across all library domains
  const allProperties = useMemo(() => {
    return state.library.domains.flatMap((domain) =>
      domain.labels.map((label) => ({
        label,
        domain,
      }))
    )
  }, [state.library.domains])

  const handleEditProperty = (domainId: string, labelId: string) => {
    setEditingDomainId(domainId)
    setEditingLabelId(labelId)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditingDomainId(null)
    setEditingLabelId(null)
  }

  if (allProperties.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No properties yet. Click + to add one.</p>
        <p className="text-xs mt-1">Properties are region labels on quality domains.</p>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 py-2 space-y-2">
        {allProperties.map(({ label, domain }) => (
          <div
            key={label.id}
            className="p-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => handleEditProperty(domain.id, label.id)}>
                <h3 className="font-medium">{label.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{domain.name}</span>
                  <span className="inline-block px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                    {isRegion(label) ? 'Region' : 'Point'}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {label.dimensions.map((d) => {
                    const dimension = domain.dimensions.find((dim) => dim.id === d.dimensionId)
                    if (!dimension) return null
                    return (
                      <div key={d.dimensionId} className="text-xs text-gray-500">
                        <span className="font-medium">{dimension.name}:</span>{' '}
                        <span className="font-mono">
                          {'range' in d
                            ? `[${d.range[0]}, ${d.range[1]}]`
                            : d.value
                          }
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <button
                onClick={() => deleteLibraryLabel(domain.id, label.id)}
                className="text-xs text-red-500 hover:text-red-700 ml-2 mt-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <LabelModal
        isOpen={isEditModalOpen}
        domainId={editingDomainId}
        editingLabelId={editingLabelId}
        onClose={handleEditModalClose}
        useLibraryState
      />
    </>
  )
}
