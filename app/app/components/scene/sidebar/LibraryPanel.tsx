'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import SidebarPanel from './SidebarPanel'
import { 
  getLibrarySectionFromPathname, 
  getDictionaryWordFromPathname, 
  getQualityDomainFromPathname, 
  LIBRARY_SECTION_LABELS 
} from './types'
import type { LibrarySection } from './types'
import { useAppStore } from '@/app/store'
import AddDictionaryWordModal from '../../dictionary/AddDictionaryWordModal'
import ConceptModal from '../../concept/ConceptModal'
import DomainModal from '../../quality-domain/DomainModal'
import DomainPickerModal from '../../quality-domain/DomainPickerModal'
import LabelModal from '../../quality-domain/LabelModal'
import Modal from '../../common/Modal'

import LibraryMenu from './library/LibraryMenu'
import DictionaryView from './library/DictionaryView'
import DictionaryWordDetailView from './library/DictionaryWordDetailView'
import ConceptsView from './library/ConceptsView'
import QualityDomainsView from './library/QualityDomainsView'
import DomainDetailView from './library/DomainDetailView'
import PropertiesView from './library/PropertiesView'
import ActionsView from './library/ActionsView'
import QualityDimensionsView from './library/QualityDimensionsView'

export default function LibraryPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, addLibraryConcept, updateLibraryConcept } = useAppStore()
  const activeSection = getLibrarySectionFromPathname(pathname)
  const dictionaryWordRoute = getDictionaryWordFromPathname(pathname)
  const domainRoute = getQualityDomainFromPathname(pathname)
  const [isAddDictWordModalOpen, setIsAddDictWordModalOpen] = useState(false)
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false)
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null)
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false)
  const [isDomainPickerOpen, setIsDomainPickerOpen] = useState(false)
  const [propertyDomainId, setPropertyDomainId] = useState<string | null>(null)
  const [isPropertyLabelModalOpen, setIsPropertyLabelModalOpen] = useState(false)
  const [editingPropertyLabelId, setEditingPropertyLabelId] = useState<string | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)

  const handleNavigateToSection = (section: LibrarySection) => {
    router.push(`/library/${section}`)
  }

  const handleBreadcrumbNavigate = (href: string) => {
    router.push(href)
  }

  const handleOpenCreateConcept = () => {
    setEditingConceptId(null)
    setIsConceptModalOpen(true)
  }

  const handleOpenEditConcept = (conceptId: string) => {
    setEditingConceptId(conceptId)
    setIsConceptModalOpen(true)
  }

  // Dictionary word detail view: /library/dictionary/<word-id>
  if (dictionaryWordRoute) {
    const wordId = dictionaryWordRoute.wordSlug
    const dictWord = state.library.dictionaryWords.find((w) => w.id === wordId)
    const dictWordTitle = dictWord?.name || 'Word'
    return (
      <SidebarPanel
        title={dictWordTitle}
        breadcrumbs={[
          { label: 'Library', href: '/library' },
          { label: 'Dictionary', href: '/library/dictionary' },
        ]}
        onNavigate={handleBreadcrumbNavigate}
      >
        <DictionaryWordDetailView wordId={wordId} />
      </SidebarPanel>
    )
  }

  // Domain detail view: /library/quality-domains/<domain-slug>
  if (domainRoute) {
    return (
      <SidebarPanel
        title={decodeURIComponent(domainRoute.domainSlug)}
        breadcrumbs={[
          { label: 'Library', href: '/library' },
          { label: 'Quality Domains', href: '/library/quality-domains' },
        ]}
        onNavigate={handleBreadcrumbNavigate}
      >
        <DomainDetailView domainSlug={domainRoute.domainSlug} />
      </SidebarPanel>
    )
  }

  // Early return if no active section
  if (!activeSection) {
    // Main library menu
    return (
      <SidebarPanel title="Library">
        <LibraryMenu onNavigate={handleNavigateToSection} />
      </SidebarPanel>
    )
  }

  const getHeaderActionProps = () => {
    switch (activeSection) {
      case 'dictionary': return { title: "Add Word", onClick: () => setIsAddDictWordModalOpen(true) }
      case 'concepts': return { title: "Add Concept", onClick: handleOpenCreateConcept }
      case 'actions': return { title: "Add Action", onClick: () => setIsActionModalOpen(true) }
      case 'quality-domains': return { title: "Add Quality Domain", onClick: () => setIsDomainModalOpen(true) }
      case 'properties': return { title: "Add Property", onClick: () => setIsDomainPickerOpen(true) }
      default: return null
    }
  }

  const headerActionProps = getHeaderActionProps()
  const headerAction = headerActionProps ? (
    <Tooltip title={headerActionProps.title}>
      <span>
        <Button
          onClick={headerActionProps.onClick}
          color="secondary"
          variant="outlined"
          size="small"
          sx={{ minWidth: 0, p: 0.5 }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
        </Button>
      </span>
    </Tooltip>
  ) : undefined

  return (
    <>
      <SidebarPanel
        title={LIBRARY_SECTION_LABELS[activeSection]}
        breadcrumbs={[
          { label: 'Library', href: '/library' },
        ]}
        onNavigate={handleBreadcrumbNavigate}
        headerAction={headerAction}
      >
        {activeSection === 'dictionary' && <DictionaryView />}
        {activeSection === 'concepts' && <ConceptsView onEdit={handleOpenEditConcept} />}
        {activeSection === 'actions' && <ActionsView />}
        {activeSection === 'quality-domains' && <QualityDomainsView />}
        {activeSection === 'properties' && <PropertiesView />}
        {activeSection === 'quality-dimensions' && <QualityDimensionsView />}
      </SidebarPanel>
      
      <AddDictionaryWordModal
        isOpen={isAddDictWordModalOpen}
        onClose={() => setIsAddDictWordModalOpen(false)}
      />
      <ConceptModal
        isOpen={isConceptModalOpen}
        editingConceptId={editingConceptId}
        onClose={() => setIsConceptModalOpen(false)}
        domains={state.library.domains}
        concepts={state.library.concepts}
        onAddConcept={addLibraryConcept}
        onUpdateConcept={updateLibraryConcept}
      />
      <DomainModal
        isOpen={isDomainModalOpen}
        editingDomainId={null}
        onClose={() => setIsDomainModalOpen(false)}
        useLibraryState
      />
      <DomainPickerModal
        isOpen={isDomainPickerOpen}
        onClose={() => setIsDomainPickerOpen(false)}
        onSelect={(domainId) => {
          setIsDomainPickerOpen(false)
          setPropertyDomainId(domainId)
          setEditingPropertyLabelId(null)
          setIsPropertyLabelModalOpen(true)
        }}
        domains={state.library.domains}
      />
      <LabelModal
        isOpen={isPropertyLabelModalOpen}
        domainId={propertyDomainId}
        editingLabelId={editingPropertyLabelId}
        onClose={() => {
          setIsPropertyLabelModalOpen(false)
          setPropertyDomainId(null)
          setEditingPropertyLabelId(null)
        }}
        useLibraryState
      />
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title="Add Action"
      >
        <p className="text-sm text-gray-500 mb-4">Action creation coming soon.</p>
        <div className="flex justify-end">
          <Button
            onClick={() => setIsActionModalOpen(false)}
            variant="outlined"
            color="secondary"
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  )
}
