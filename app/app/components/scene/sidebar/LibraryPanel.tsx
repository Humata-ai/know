'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import SidebarPanel from './SidebarPanel'
import { 
  getLibrarySectionFromPathname, 
  getDictionaryWordFromPathname, 
  getQualityDomainFromPathname, 
  getConceptsWordFromPathname,
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

function ConceptDetailView({ conceptId }: { conceptId: string }) {
  const { state, deleteLibraryConcept } = useAppStore()
  const router = useRouter()

  const concept = state.library.concepts.find((c) => c.id === conceptId)

  if (!concept) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Concept not found.</p>
      </div>
    )
  }

  const handleDelete = () => {
    deleteLibraryConcept(concept.id)
    router.push('/library/concepts')
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {concept.labelRefs.length} {concept.labelRefs.length === 1 ? 'label' : 'labels'}
        </span>
      </div>

      {concept.labelRefs.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Labels</h4>
          <div className="space-y-2">
            {concept.labelRefs.map((labelRef, index) => {
              const domain = state.library.domains.find(d => d.id === labelRef.domainId)
              const label = domain?.labels.find(l => l.id === labelRef.labelId)
              if (!domain || !label) return null
              
              return (
                <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                  <div className="font-medium">{label.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">in {domain.name}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Delete concept
        </button>
      </div>
    </div>
  )
}

export default function LibraryPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, addLibraryConcept, updateLibraryConcept } = useAppStore()
  const activeSection = getLibrarySectionFromPathname(pathname)
  const dictionaryWordRoute = getDictionaryWordFromPathname(pathname)
  const domainRoute = getQualityDomainFromPathname(pathname)
  const conceptRoute = getConceptsWordFromPathname(pathname)
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

  // Concept detail view: /library/concepts/<concept-id>
  if (conceptRoute && !conceptRoute.isEdit) {
    const conceptId = conceptRoute.wordSlug
    const concept = state.library.concepts.find((c) => c.id === conceptId)
    const conceptTitle = concept?.name || 'Concept'
    return (
      <SidebarPanel
        title={conceptTitle}
        breadcrumbs={[
          { label: 'Library', href: '/library' },
          { label: 'Concepts', href: '/library/concepts' },
        ]}
        onNavigate={handleBreadcrumbNavigate}
      >
        <ConceptDetailView conceptId={conceptId} />
      </SidebarPanel>
    )
  }

  // Domain detail view: /library/quality-domains/<domain-id>
  if (domainRoute) {
    const domain = state.library.domains.find(
      (d) => d.name.toLowerCase().replace(/\s+/g, '-') === domainRoute.domainId
    )
    const headerAction = domain ? (
      <Tooltip title="Edit Quality Domain">
        <span>
          <Button
            onClick={() => {
              setEditingLibraryDomainId(domain.id)
              setIsDomainModalOpen(true)
            }}
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ minWidth: 0, p: 0.5 }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </Button>
        </span>
      </Tooltip>
    ) : undefined

    return (
      <>
        <SidebarPanel
          title={domain ? domain.name : decodeURIComponent(domainRoute.domainId)}
          breadcrumbs={[
            { label: 'Library', href: '/library' },
            { label: 'Quality Domains', href: '/library/quality-domains' },
          ]}
          onNavigate={handleBreadcrumbNavigate}
          headerAction={headerAction}
        >
          <DomainDetailView domainSlug={domainRoute.domainId} />
        </SidebarPanel>
        <DomainModal
          isOpen={isDomainModalOpen}
          editingDomainId={editingLibraryDomainId}
          onClose={() => setIsDomainModalOpen(false)}
          useLibraryState
        />
      </>
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
      case 'quality-domains': return { title: "Add Quality Domain", onClick: () => {
        setEditingLibraryDomainId(null)
        setIsDomainModalOpen(true)
      }}
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
        editingDomainId={editingLibraryDomainId}
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
