'use client'

import { useState } from 'react'
import { useQualityDomain } from '@/app/store'
import PropertyCard from './PropertyCard'
import PropertyModal from './PropertyModal'
import Button from '@mui/material/Button'

export default function PropertyList() {
  const { state, getSelectedDomain } = useQualityDomain()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null)

  const selectedDomain = getSelectedDomain()

  if (!selectedDomain) {
    return null
  }

  return (
    <>
      <div className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-h-[calc(100vh-2rem)] overflow-y-auto max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Properties</h2>
        </div>

        <div className="text-xs text-gray-600 mb-3 px-1">
          Domain: <span className="font-medium">{selectedDomain.name}</span>
        </div>

        {selectedDomain.labels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No properties yet.</p>
            <p className="text-xs mt-1">Click "Define property" to create one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDomain.labels.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                domain={selectedDomain}
                isSelected={
                  state.scene.selectedLabelId === property.id &&
                  state.scene.selectedLabelDomainId === selectedDomain.id
                }
                onEdit={(id) => {
                  setEditingPropertyId(id)
                  setIsModalOpen(true)
                }}
              />
            ))}
          </div>
        )}

        {/* Define property button */}
        <Button
          onClick={() => {
            setEditingPropertyId(null)
            setIsModalOpen(true)
          }}
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 1, textTransform: 'none' }}
        >
          Define property
        </Button>
      </div>

      <PropertyModal
        isOpen={isModalOpen}
        domainId={selectedDomain.id}
        editingPropertyId={editingPropertyId}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
