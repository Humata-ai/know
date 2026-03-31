'use client'

import { useState } from 'react'
import { useQualityDomain } from '@/app/store'
import ConceptCard from '../../concept/ConceptCard'
import ConceptModal from '../../concept/ConceptModal'
import Button from '@mui/material/Button'
import CollapsibleSection from './CollapsibleSection'

export default function ConceptsSection() {
  const { state, addConcept, updateConcept } = useQualityDomain()
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false)
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null)

  return (
    <>
      <CollapsibleSection title="Concepts">
        {state.scene.concepts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No concepts yet.</p>
            <p className="text-xs mt-1">Click &quot;New concept&quot; to create one.</p>
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
                  setIsConceptModalOpen(true)
                }}
              />
            ))}
          </div>
        )}

        <Button
          onClick={() => {
            setEditingConceptId(null)
            setIsConceptModalOpen(true)
          }}
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 1, textTransform: 'none' }}
        >
          New concept
        </Button>
      </CollapsibleSection>

      <ConceptModal
        isOpen={isConceptModalOpen}
        editingConceptId={editingConceptId}
        onClose={() => setIsConceptModalOpen(false)}
        domains={state.scene.domains}
        concepts={state.scene.concepts}
        onAddConcept={addConcept}
        onUpdateConcept={updateConcept}
      />
    </>
  )
}
