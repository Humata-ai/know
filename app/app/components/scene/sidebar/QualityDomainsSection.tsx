'use client'

import { useState } from 'react'
import { useQualityDomain } from '@/app/store'
import DomainCard from '../../quality-domain/DomainCard'
import DomainModal from '../../quality-domain/DomainModal'
import PropertyCard from '../../quality-domain/PropertyCard'
import PropertyModal from '../../quality-domain/PropertyModal'
import Button from '@mui/material/Button'
import CollapsibleSection from './CollapsibleSection'

export default function QualityDomainsSection() {
  const { state } = useQualityDomain()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null)

  return (
    <>
      <CollapsibleSection title="Quality Domains" borderBottom>
        {state.scene.domains.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No domains yet.</p>
            <p className="text-xs mt-1">Click &quot;New domain&quot; to create one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.scene.domains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                isSelected={state.scene.selectedDomainId === domain.id}
                onEdit={(id) => {
                  setEditingDomainId(id)
                  setIsModalOpen(true)
                }}
              >
                {(state.scene.selectedDomainId === domain.id || state.scene.selectedPropertyDomainId === domain.id) && (
                  <div className="pl-2">
                    {domain.properties.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-xs">No properties yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 mb-2">
                        {domain.properties.map((property) => (
                          <PropertyCard
                            key={property.id}
                            property={property}
                            domain={domain}
                            isSelected={
                              state.scene.selectedPropertyId === property.id &&
                              state.scene.selectedPropertyDomainId === domain.id
                            }
                            onEdit={(id) => {
                              setEditingPropertyId(id)
                              setIsPropertyModalOpen(true)
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        setEditingPropertyId(null)
                        setIsPropertyModalOpen(true)
                      }}
                      variant="outlined"
                      color="primary"
                      fullWidth
                      sx={{ textTransform: 'none' }}
                    >
                      Define property
                    </Button>
                  </div>
                )}
              </DomainCard>
            ))}
          </div>
        )}

        <Button
          onClick={() => {
            setEditingDomainId(null)
            setIsModalOpen(true)
          }}
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 1, textTransform: 'none' }}
        >
          New domain
        </Button>
      </CollapsibleSection>

      <DomainModal
        isOpen={isModalOpen}
        editingDomainId={editingDomainId}
        onClose={() => setIsModalOpen(false)}
      />

      {(state.scene.selectedDomainId || state.scene.selectedPropertyDomainId) && (
        <PropertyModal
          isOpen={isPropertyModalOpen}
          domainId={state.scene.selectedDomainId || state.scene.selectedPropertyDomainId}
          editingPropertyId={editingPropertyId}
          onClose={() => setIsPropertyModalOpen(false)}
        />
      )}
    </>
  )
}
