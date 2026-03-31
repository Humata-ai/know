'use client'

import { useState } from 'react'
import { useQualityDomain } from '@/app/store'
import ConceptCard from './ConceptCard'
import ConceptModal from './ConceptModal'
import Button from '@mui/material/Button'

export default function ConceptList() {
  const { state, addConcept, updateConcept } = useQualityDomain()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null)

  return (
    <>
      <div className="absolute bottom-4 left-4 z-30 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-h-[calc(50vh-2rem)] overflow-y-auto max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Concepts</h2>
        </div>

        {state.scene.concepts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No concepts yet.</p>
            <p className="text-xs mt-1">Click "+ Add Concept" to create one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.scene.concepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                isSelected={state.scene.selectedConceptId === concept.id && !state.scene.selectedInstanceId}
                onEdit={(id) => {
                  setEditingConceptId(id)
                  setIsModalOpen(true)
                }}
              />
            ))}
          </div>
        )}

        {/* Add Concept button */}
        <Button
          onClick={() => {
            setEditingConceptId(null)
            setIsModalOpen(true)
          }}
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 1, textTransform: 'none' }}
        >
          New Concept
        </Button>
      </div>

      <ConceptModal
        isOpen={isModalOpen}
        editingConceptId={editingConceptId}
        onClose={() => setIsModalOpen(false)}
        domains={state.scene.domains}
        concepts={state.scene.concepts}
        onAddConcept={addConcept}
        onUpdateConcept={updateConcept}
      />
    </>
  )
}
