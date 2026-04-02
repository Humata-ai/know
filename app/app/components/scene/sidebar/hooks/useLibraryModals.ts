import { useState } from 'react'

export function useLibraryModals() {
  const [isAddDictWordModalOpen, setIsAddDictWordModalOpen] = useState(false)
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false)
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null)
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false)
  const [editingLibraryDomainId, setEditingLibraryDomainId] = useState<string | null>(null)
  const [isDomainPickerOpen, setIsDomainPickerOpen] = useState(false)
  const [propertyDomainId, setPropertyDomainId] = useState<string | null>(null)
  const [isPropertyLabelModalOpen, setIsPropertyLabelModalOpen] = useState(false)
  const [editingPropertyLabelId, setEditingPropertyLabelId] = useState<string | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)

  const openCreateConcept = () => {
    setEditingConceptId(null)
    setIsConceptModalOpen(true)
  }

  const openEditConcept = (conceptId: string) => {
    setEditingConceptId(conceptId)
    setIsConceptModalOpen(true)
  }

  const openCreateDomain = () => {
    setEditingLibraryDomainId(null)
    setIsDomainModalOpen(true)
  }

  const openEditDomain = (domainId: string) => {
    setEditingLibraryDomainId(domainId)
    setIsDomainModalOpen(true)
  }

  const openPropertyPicker = () => {
    setIsDomainPickerOpen(true)
  }

  const handlePropertyDomainSelect = (domainId: string) => {
    setIsDomainPickerOpen(false)
    setPropertyDomainId(domainId)
    setEditingPropertyLabelId(null)
    setIsPropertyLabelModalOpen(true)
  }

  const closePropertyLabelModal = () => {
    setIsPropertyLabelModalOpen(false)
    setPropertyDomainId(null)
    setEditingPropertyLabelId(null)
  }

  return {
    // Dictionary word modal
    isAddDictWordModalOpen,
    setIsAddDictWordModalOpen,
    
    // Concept modal
    isConceptModalOpen,
    setIsConceptModalOpen,
    editingConceptId,
    openCreateConcept,
    openEditConcept,
    
    // Domain modal
    isDomainModalOpen,
    setIsDomainModalOpen,
    editingLibraryDomainId,
    openCreateDomain,
    openEditDomain,
    
    // Property modals
    isDomainPickerOpen,
    setIsDomainPickerOpen,
    propertyDomainId,
    isPropertyLabelModalOpen,
    editingPropertyLabelId,
    openPropertyPicker,
    handlePropertyDomainSelect,
    closePropertyLabelModal,
    
    // Action modal
    isActionModalOpen,
    setIsActionModalOpen,
  }
}
