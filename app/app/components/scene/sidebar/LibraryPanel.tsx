'use client'

import { usePathname, useRouter } from 'next/navigation'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import SidebarPanel from './SidebarPanel'
import { 
  getLibrarySectionFromPathname, 
  getLibraryDetailFromPathname,
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
import PropertyDetailView from './library/PropertyDetailView'
import ActionsView from './library/ActionsView'
import ActionDetailView from './library/ActionDetailView'
import QualityDimensionsView from './library/QualityDimensionsView'
import ConceptDetailView from './library/ConceptDetailView'
import { useLibraryModals } from './hooks/useLibraryModals'

export default function LibraryPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, addLibraryConcept, updateLibraryConcept } = useAppStore()
  const activeSection = getLibrarySectionFromPathname(pathname)
  const detailRoute = getLibraryDetailFromPathname(pathname)
  
  const modals = useLibraryModals()

  const handleNavigateToSection = (section: LibrarySection) => {
    router.push(`/library/${section}`)
  }

  const handleBreadcrumbNavigate = (href: string) => {
    router.push(href)
  }

  // Handle detail views: /library/<section>/<id>
  if (detailRoute) {
    const { section, itemId } = detailRoute
    
    // Get item title and render appropriate detail view
    let title = 'Item'
    let detailView = null
    let headerAction = undefined

    switch (section) {
      case 'dictionary': {
        const word = state.library.dictionaryWords.find((w) => w.id === itemId)
        title = word?.name || 'Word'
        detailView = <DictionaryWordDetailView wordId={itemId} />
        break
      }
      case 'concepts': {
        const concept = state.library.concepts.find((c) => c.id === itemId)
        title = concept?.name || 'Concept'
        detailView = <ConceptDetailView conceptId={itemId} />
        break
      }
      case 'quality-domains': {
        const domain = state.library.domains.find((d) => d.id === itemId)
        title = domain?.name || 'Domain'
        detailView = <DomainDetailView domainId={itemId} />
        if (domain) {
          headerAction = (
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
          )
        }
        break
      }
      case 'actions': {
        const action = state.library.actions?.find((a) => a.id === itemId)
        title = action?.name || 'Action'
        detailView = <ActionDetailView actionId={itemId} />
        break
      }
      case 'properties': {
        // Find property across all domains
        let property = null
        for (const domain of state.library.domains) {
          const label = domain.labels.find((l) => l.id === itemId)
          if (label) {
            property = label
            break
          }
        }
        title = property?.name || 'Property'
        detailView = <PropertyDetailView propertyId={itemId} />
        break
      }
    }

    return (
      <>
        <SidebarPanel
          title={title}
          breadcrumbs={[
            { label: 'Library', href: '/library' },
            { label: LIBRARY_SECTION_LABELS[section], href: `/library/${section}` },
          ]}
          onNavigate={handleBreadcrumbNavigate}
          headerAction={headerAction}
        >
          {detailView}
        </SidebarPanel>
        {section === 'quality-domains' && (
          <DomainModal
            isOpen={modals.isDomainModalOpen}
            editingDomainId={modals.editingLibraryDomainId}
            onClose={() => modals.setIsDomainModalOpen(false)}
            useLibraryState
          />
        )}
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
