'use client'

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
import AddActionModal from '../../library-action/AddActionModal'

import LibraryMenu from './library/LibraryMenu'
import DictionaryView from './library/DictionaryView'
import DictionaryWordDetailView from './library/DictionaryWordDetailView'
import ConceptsView from './library/ConceptsView'
import QualityDomainsView from './library/QualityDomainsView'
import DomainDetailView from './library/DomainDetailView'
import PropertiesView from './library/PropertiesView'
import ActionsView from './library/ActionsView'
import QualityDimensionsView from './library/QualityDimensionsView'
import ConceptDetailView from './library/ConceptDetailView'
import { useLibraryModals } from './hooks/useLibraryModals'

export default function LibraryPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, addLibraryConcept, updateLibraryConcept } = useAppStore()
  const activeSection = getLibrarySectionFromPathname(pathname)
  const dictionaryWordRoute = getDictionaryWordFromPathname(pathname)
  const domainRoute = getQualityDomainFromPathname(pathname)
  const conceptRoute = getConceptsWordFromPathname(pathname)
  
  const modals = useLibraryModals()

  const handleNavigateToSection = (section: LibrarySection) => {
    router.push(`/library/${section}`)
  }

  const handleBreadcrumbNavigate = (href: string) => {
    router.push(href)
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
      (d) => d.id === domainRoute.domainId
    )
    const headerAction = domain ? (
      <Tooltip title="Edit Quality Domain">
        <span>
          <Button
            onClick={() => modals.openEditDomain(domain.id)}
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
          title={domain ? domain.name : 'Domain not found'}
          breadcrumbs={[
            { label: 'Library', href: '/library' },
            { label: 'Quality Domains', href: '/library/quality-domains' },
          ]}
          onNavigate={handleBreadcrumbNavigate}
          headerAction={headerAction}
        >
          <DomainDetailView domainId={domainRoute.domainId} />
        </SidebarPanel>
        <DomainModal
          isOpen={modals.isDomainModalOpen}
          editingDomainId={modals.editingLibraryDomainId}
          onClose={() => modals.setIsDomainModalOpen(false)}
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
      case 'dictionary': return { title: "Add Word", onClick: () => modals.setIsAddDictWordModalOpen(true) }
      case 'concepts': return { title: "Add Concept", onClick: modals.openCreateConcept }
      case 'actions': return { title: "Add Action", onClick: () => modals.setIsActionModalOpen(true) }
      case 'quality-domains': return { title: "Add Quality Domain", onClick: modals.openCreateDomain }
      case 'properties': return { title: "Add Property", onClick: modals.openPropertyPicker }
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
        {activeSection === 'concepts' && <ConceptsView />}
        {activeSection === 'actions' && <ActionsView />}
        {activeSection === 'quality-domains' && <QualityDomainsView />}
        {activeSection === 'properties' && <PropertiesView />}
        {activeSection === 'quality-dimensions' && <QualityDimensionsView />}
      </SidebarPanel>
      
      <AddDictionaryWordModal
        isOpen={modals.isAddDictWordModalOpen}
        onClose={() => modals.setIsAddDictWordModalOpen(false)}
      />
      <ConceptModal
        isOpen={modals.isConceptModalOpen}
        editingConceptId={modals.editingConceptId}
        onClose={() => modals.setIsConceptModalOpen(false)}
        domains={state.library.domains}
        concepts={state.library.concepts}
        onAddConcept={addLibraryConcept}
        onUpdateConcept={updateLibraryConcept}
      />
      <DomainModal
        isOpen={modals.isDomainModalOpen}
        editingDomainId={modals.editingLibraryDomainId}
        onClose={() => modals.setIsDomainModalOpen(false)}
        useLibraryState
      />
      <DomainPickerModal
        isOpen={modals.isDomainPickerOpen}
        onClose={() => modals.setIsDomainPickerOpen(false)}
        onSelect={modals.handlePropertyDomainSelect}
        domains={state.library.domains}
      />
      <LabelModal
        isOpen={modals.isPropertyLabelModalOpen}
        domainId={modals.propertyDomainId}
        editingLabelId={modals.editingPropertyLabelId}
        onClose={modals.closePropertyLabelModal}
        useLibraryState
      />
      <AddActionModal
        isOpen={modals.isActionModalOpen}
        onClose={() => modals.setIsActionModalOpen(false)}
      />
    </>
  )
}
