'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CategoryIcon from '@mui/icons-material/Category'
import TuneIcon from '@mui/icons-material/Tune'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SidebarPanel from './SidebarPanel'
import { getLibrarySectionFromPathname, getQualityDomainFromPathname, LIBRARY_SECTION_LABELS } from './types'
import type { LibrarySection } from './types'
import { useAppStore } from '@/app/store'
import ConceptModal from '../../concept/ConceptModal'
import DomainModal from '../../quality-domain/DomainModal'

const LIBRARY_MENU_ITEMS: { section: LibrarySection; icon: React.ReactNode }[] = [
  { section: 'concepts', icon: <MenuBookIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'quality-domains', icon: <CategoryIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'quality-dimensions', icon: <TuneIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
]

function LibraryMenu({ onNavigate }: { onNavigate: (section: LibrarySection) => void }) {
  return (
    <div className="py-1">
      {LIBRARY_MENU_ITEMS.map(({ section, icon }) => (
        <button
          key={section}
          onClick={() => onNavigate(section)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {icon}
            <Typography variant="body1">
              {LIBRARY_SECTION_LABELS[section]}
            </Typography>
          </div>
          <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </button>
      ))}
    </div>
  )
}

function ConceptsView({
  onEdit,
}: {
  onEdit: (conceptId: string) => void
}) {
  const { state, deleteLibraryConcept, selectLibraryItem, clearLibrarySelection } = useAppStore()

  if (state.library.concepts.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No concepts yet. Click + to add one.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {state.library.concepts.map((concept) => {
        const isViewing = state.library.selectedItemType === 'concept' && state.library.selectedItemId === concept.id
        return (
          <div
            key={concept.id}
            className={`w-full p-3 rounded-lg border transition-colors text-left ${
              isViewing
                ? 'bg-blue-50 border-blue-400'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{concept.name}</h3>
              <div className="flex items-center gap-1">
                <Tooltip title={isViewing ? 'Hide from 3D viewer' : 'View in 3D'}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (isViewing) {
                        clearLibrarySelection()
                      } else {
                        selectLibraryItem(concept.id, 'concept')
                      }
                    }}
                    sx={{ color: isViewing ? 'primary.main' : 'text.secondary' }}
                  >
                    {isViewing ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(concept.id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => deleteLibraryConcept(concept.id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {concept.labelRefs.length} {concept.labelRefs.length === 1 ? 'label' : 'labels'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function QualityDomainsView() {
  const router = useRouter()
  const { state, selectLibraryItem, clearLibrarySelection } = useAppStore()

  if (state.library.domains.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No quality domains yet. Click + to add one.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {state.library.domains.map((domain) => {
        const slug = domain.name.toLowerCase().replace(/\s+/g, '-')
        const isViewing = state.library.selectedItemType === 'quality-domain' && state.library.selectedItemId === domain.id
        return (
          <div
            key={domain.id}
            className={`w-full p-3 rounded-lg border transition-colors text-left ${
              isViewing
                ? 'bg-blue-50 border-blue-400'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push(`/library/quality-domains/${encodeURIComponent(slug)}`)}
                className="font-medium hover:underline cursor-pointer text-left flex-1"
              >
                {domain.name}
              </button>
              <Tooltip title={isViewing ? 'Hide from 3D viewer' : 'View in 3D'}>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (isViewing) {
                      clearLibrarySelection()
                    } else {
                      selectLibraryItem(domain.id, 'quality-domain')
                    }
                  }}
                  sx={{ color: isViewing ? 'primary.main' : 'text.secondary' }}
                >
                  {isViewing ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {domain.dimensions.length}D
              </span>
              <span className="text-xs text-gray-500">
                {domain.labels.length} {domain.labels.length === 1 ? 'label' : 'labels'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DomainDetailView({ domainSlug }: { domainSlug: string }) {
  const { state } = useAppStore()

  const domain = state.library.domains.find(
    (d) => d.name.toLowerCase().replace(/\s+/g, '-') === domainSlug
  )

  if (!domain) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Domain not found.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {domain.dimensions.length}D
        </span>
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {domain.labels.length} {domain.labels.length === 1 ? 'label' : 'labels'}
        </span>
      </div>

      {domain.dimensions.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Dimensions</h4>
          <div className="space-y-1">
            {domain.dimensions.map((dim) => (
              <div key={dim.id} className="text-sm text-gray-700 flex items-center justify-between">
                <span>{dim.name}</span>
                <span className="text-xs text-gray-400">[{dim.range[0]}, {dim.range[1]}]</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {domain.labels.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Labels</h4>
          <div className="space-y-1">
            {domain.labels.map((label) => (
              <div key={label.id} className="text-sm text-gray-700">
                {label.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function QualityDimensionsView() {
  return (
    <div className="px-4 py-2">
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Quality Dimensions library coming soon.</p>
      </div>
    </div>
  )
}

export default function LibraryPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, addLibraryConcept, updateLibraryConcept } = useAppStore()
  const activeSection = getLibrarySectionFromPathname(pathname)
  const domainRoute = getQualityDomainFromPathname(pathname)
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false)
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null)
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false)

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

  // Sub-section view
  if (activeSection) {
    const headerAction = activeSection === 'concepts' ? (
      <Tooltip title="Add Concept">
        <span>
          <Button
            onClick={handleOpenCreateConcept}
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ minWidth: 0, p: 0.5 }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </Button>
        </span>
      </Tooltip>
    ) : activeSection === 'quality-domains' ? (
      <Tooltip title="Add Quality Domain">
        <span>
          <Button
            onClick={() => setIsDomainModalOpen(true)}
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
          {activeSection === 'concepts' && (
            <ConceptsView onEdit={handleOpenEditConcept} />
          )}
          {activeSection === 'quality-domains' && <QualityDomainsView />}
          {activeSection === 'quality-dimensions' && <QualityDimensionsView />}
        </SidebarPanel>
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
      </>
    )
  }

  // Main library menu
  return (
    <SidebarPanel title="Library">
      <LibraryMenu onNavigate={handleNavigateToSection} />
    </SidebarPanel>
  )
}
