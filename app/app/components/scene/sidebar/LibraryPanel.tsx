'use client'

import { useState, useMemo, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import CategoryIcon from '@mui/icons-material/Category'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import TuneIcon from '@mui/icons-material/Tune'
import LabelIcon from '@mui/icons-material/Label'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SidebarPanel from './SidebarPanel'
import { getLibrarySectionFromPathname, getDictionaryWordFromPathname, getQualityDomainFromPathname, LIBRARY_SECTION_LABELS } from './types'
import type { LibrarySection } from './types'
import { useAppStore } from '@/app/store'
import AddDictionaryWordModal from '../../dictionary/AddDictionaryWordModal'
import { getDictionaryWordName, getDictionaryWordType } from '../../dictionary/utils'
import ConceptModal from '../../concept/ConceptModal'
import { isRegion } from '../../shared/types'
import DomainModal from '../../quality-domain/DomainModal'
import DomainPickerModal from '../../quality-domain/DomainPickerModal'
import LabelModal from '../../quality-domain/LabelModal'
import Modal from '../../common/Modal'

const LIBRARY_MENU_ITEMS: { section: LibrarySection; icon: React.ReactNode }[] = [
  { section: 'dictionary', icon: <MenuBookIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'concepts', icon: <BubbleChartIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'actions', icon: <PlayArrowIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'quality-domains', icon: <CategoryIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'quality-dimensions', icon: <TuneIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'properties', icon: <LabelIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
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

function DictionaryView() {
  const router = useRouter()
  const { state } = useAppStore()

  if (state.library.dictionaryWords.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No words registered yet. Click + to add one.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {state.library.dictionaryWords.map((word) => {
        const pointerName = getDictionaryWordName(word, state.library.domains, state.library.concepts)
        const typeLabel = getDictionaryWordType(word, state.library.domains)
        return (
          <button
            key={word.id}
            onClick={() => router.push(`/library/dictionary/${encodeURIComponent(word.id)}`)}
            className="w-full p-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors text-left"
          >
            <h3 className="font-medium">{word.name}</h3>
            <span className="text-xs text-gray-500">
              {typeLabel}: {pointerName}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function DictionaryWordDetailView({ wordId }: { wordId: string }) {
  const { state, deleteDictionaryWord } = useAppStore()
  const router = useRouter()

  const word = state.library.dictionaryWords.find((w) => w.id === wordId)

  if (!word) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Word not found.</p>
      </div>
    )
  }

  const typeLabel = getDictionaryWordType(word, state.library.domains)

  const linkedConcept = word.conceptId
    ? state.library.concepts.find((c) => c.id === word.conceptId)
    : null

  const linkedLabel = word.labelRef
    ? (() => {
        const domain = state.library.domains.find((d) => d.id === word.labelRef!.domainId)
        if (!domain) return null
        const label = domain.labels.find((l) => l.id === word.labelRef!.labelId)
        return label ? { label, domain } : null
      })()
    : null

  const handleDelete = () => {
    deleteDictionaryWord(word.id)
    router.push('/library/dictionary')
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
          {typeLabel}
        </span>
      </div>

      {linkedLabel && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Label</h4>
          <p className="text-sm text-gray-700">{linkedLabel.label.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            in {linkedLabel.domain.name}
          </p>
        </div>
      )}

      {linkedConcept && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Concept</h4>
          <p className="text-sm text-gray-700">{linkedConcept.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {linkedConcept.labelRefs.length} {linkedConcept.labelRefs.length === 1 ? 'label' : 'labels'}
          </p>
        </div>
      )}

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Added</h4>
        <p className="text-sm text-gray-700">{word.createdAt.toLocaleDateString()}</p>
      </div>

      <div className="pt-2">
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Remove from dictionary
        </button>
      </div>
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
            onClick={() => {
              if (isViewing) {
                clearLibrarySelection()
              } else {
                selectLibraryItem(concept.id, 'concept')
              }
            }}
            className={`w-full p-3 rounded-lg border transition-colors text-left cursor-pointer ${isViewing
              ? 'bg-blue-50 border-blue-400'
              : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{concept.name}</h3>
              <div className="flex items-center gap-1">
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onEdit(concept.id) }}
                    sx={{ color: 'text.secondary' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); deleteLibraryConcept(concept.id) }}
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
  const { state } = useAppStore()

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
        return (
          <button
            key={domain.id}
            onClick={() => router.push(`/library/quality-domains/${encodeURIComponent(slug)}`)}
            className="w-full p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="font-medium">{domain.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {domain.dimensions.length}D
              </span>
              <span className="text-xs text-gray-500">
                {domain.labels.length} {domain.labels.length === 1 ? 'label' : 'labels'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function DomainDetailView({ domainSlug }: { domainSlug: string }) {
  const { state, selectLibraryItem, clearLibrarySelection } = useAppStore()

  const domain = state.library.domains.find(
    (d) => d.name.toLowerCase().replace(/\s+/g, '-') === domainSlug
  )

  // Auto-select domain for 3D visualization when detail page is open
  useEffect(() => {
    if (domain) {
      selectLibraryItem(domain.id, 'quality-domain')
    }
    return () => {
      clearLibrarySelection()
    }
  }, [domain?.id, selectLibraryItem, clearLibrarySelection])

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

function PropertiesView() {
  const { state, deleteLibraryLabel } = useAppStore()
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Collect all labels across all library domains
  const allProperties = useMemo(() => {
    return state.library.domains.flatMap((domain) =>
      domain.labels.map((label) => ({
        label,
        domain,
      }))
    )
  }, [state.library.domains])

  const handleEditProperty = (domainId: string, labelId: string) => {
    setEditingDomainId(domainId)
    setEditingLabelId(labelId)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditingDomainId(null)
    setEditingLabelId(null)
  }

  if (allProperties.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No properties yet. Click + to add one.</p>
        <p className="text-xs mt-1">Properties are region labels on quality domains.</p>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 py-2 space-y-2">
        {allProperties.map(({ label, domain }) => (
          <div
            key={label.id}
            className="p-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => handleEditProperty(domain.id, label.id)}>
                <h3 className="font-medium">{label.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{domain.name}</span>
                  <span className="inline-block px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                    {isRegion(label) ? 'Region' : 'Point'}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {label.dimensions.map((d) => {
                    const dimension = domain.dimensions.find((dim) => dim.id === d.dimensionId)
                    if (!dimension) return null
                    return (
                      <div key={d.dimensionId} className="text-xs text-gray-500">
                        <span className="font-medium">{dimension.name}:</span>{' '}
                        <span className="font-mono">
                          {'range' in d
                            ? `[${d.range[0]}, ${d.range[1]}]`
                            : d.value
                          }
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <button
                onClick={() => deleteLibraryLabel(domain.id, label.id)}
                className="text-xs text-red-500 hover:text-red-700 ml-2 mt-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <LabelModal
        isOpen={isEditModalOpen}
        domainId={editingDomainId}
        editingLabelId={editingLabelId}
        onClose={handleEditModalClose}
        useLibraryState
      />
    </>
  )
}

function ActionsView() {
  return (
    <div className="px-4 py-8 text-center text-gray-500">
      <p className="text-sm">No actions yet. Click + to add one.</p>
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

  // Sub-section view
  if (activeSection) {
    const headerAction = activeSection === 'dictionary' ? (
      <Tooltip title="Add Word">
        <span>
          <Button
            onClick={() => setIsAddDictWordModalOpen(true)}
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ minWidth: 0, p: 0.5 }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </Button>
        </span>
      </Tooltip>
    ) : activeSection === 'concepts' ? (
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
    ) : activeSection === 'actions' ? (
      <Tooltip title="Add Action">
        <span>
          <Button
            onClick={() => setIsActionModalOpen(true)}
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
    ) : activeSection === 'properties' ? (
      <Tooltip title="Add Property">
        <span>
          <Button
            onClick={() => setIsDomainPickerOpen(true)}
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
          {activeSection === 'concepts' && (
            <ConceptsView onEdit={handleOpenEditConcept} />
          )}
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

  // Main library menu
  return (
    <SidebarPanel title="Library">
      <LibraryMenu onNavigate={handleNavigateToSection} />
    </SidebarPanel>
  )
}
