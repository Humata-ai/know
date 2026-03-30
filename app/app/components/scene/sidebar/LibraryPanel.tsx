'use client'

import { useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CategoryIcon from '@mui/icons-material/Category'
import TuneIcon from '@mui/icons-material/Tune'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SidebarPanel from './SidebarPanel'
import { getLibrarySectionFromPathname, getConceptsWordFromPathname, LIBRARY_SECTION_LABELS } from './types'
import type { LibrarySection } from './types'
import { useAppStore } from '@/app/store'
import { WORD_CLASS_LABELS } from '../../shared/types'
import AddWordModal from '../../concepts/AddWordModal'
import WordEditView from '../../concepts/WordEditView'
import type { WordEditViewHandle } from '../../concepts/WordEditView'
import WordDetailView from '../../concepts/WordDetailView'
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

function ConceptsView() {
  const router = useRouter()
  const { state } = useAppStore()

  if (state.library.words.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">No words yet. Click + to add one.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {state.library.words.map((word) => {
        const slug = word.name.toLowerCase().replace(/\s+/g, '-')
        return (
          <button
            key={word.id}
            onClick={() => router.push(`/library/concepts/${encodeURIComponent(slug)}`)}
            className="w-full p-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors text-left"
          >
            <h3 className="font-medium">{word.name}</h3>
            <span className="text-xs text-gray-500">{WORD_CLASS_LABELS[word.wordClass]}</span>
          </button>
        )
      })}
    </div>
  )
}

function QualityDomainsView() {
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
      {state.library.domains.map((domain) => (
        <div
          key={domain.id}
          className="w-full p-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-left"
        >
          <h3 className="font-medium">{domain.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {domain.dimensions.length}D
            </span>
            <span className="text-xs text-gray-500">
              {domain.labels.length} {domain.labels.length === 1 ? 'label' : 'labels'}
            </span>
          </div>
        </div>
      ))}
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

const SECTION_VIEWS: Record<LibrarySection, React.ComponentType> = {
  'concepts': ConceptsView,
  'quality-domains': QualityDomainsView,
  'quality-dimensions': QualityDimensionsView,
}

export default function LibraryPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const activeSection = getLibrarySectionFromPathname(pathname)
  const wordRoute = getConceptsWordFromPathname(pathname)
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false)
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false)
  const wordEditRef = useRef<WordEditViewHandle>(null)

  const handleNavigateToSection = (section: LibrarySection) => {
    router.push(`/library/${section}`)
  }

  const handleBreadcrumbNavigate = (href: string) => {
    router.push(href)
  }

  // Word detail or edit view: /library/concepts/<word> or /library/concepts/<word>/edit
  if (wordRoute) {
    const titleSegments = [
      { label: 'Library', href: '/library' },
      { label: 'Concepts', href: '/library/concepts' },
      { label: decodeURIComponent(wordRoute.wordSlug) },
    ]

    const wordHeaderAction = wordRoute.isEdit ? (
      <Tooltip title="Save">
        <IconButton
          size="small"
          onClick={() => wordEditRef.current?.save()}
          sx={{ color: 'text.secondary' }}
        >
          <SaveIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ) : (
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={() => router.push(`/library/concepts/${encodeURIComponent(wordRoute.wordSlug)}/edit`)}
          sx={{ color: 'text.secondary' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )

    return (
      <SidebarPanel
        title={titleSegments}
        onNavigate={handleBreadcrumbNavigate}
        headerAction={wordHeaderAction}
      >
        {wordRoute.isEdit ? (
          <WordEditView ref={wordEditRef} wordSlug={wordRoute.wordSlug} />
        ) : (
          <WordDetailView wordSlug={wordRoute.wordSlug} />
        )}
      </SidebarPanel>
    )
  }

  // Sub-section view with breadcrumb
  if (activeSection) {
    const SectionView = SECTION_VIEWS[activeSection]

    const headerAction = activeSection === 'concepts' ? (
      <Tooltip title="Add Word">
        <span>
          <Button
            onClick={() => setIsAddWordModalOpen(true)}
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
          title={[
            { label: 'Library', href: '/library' },
            { label: LIBRARY_SECTION_LABELS[activeSection] },
          ]}
          onNavigate={handleBreadcrumbNavigate}
          headerAction={headerAction}
        >
          <SectionView />
        </SidebarPanel>
        <AddWordModal
          isOpen={isAddWordModalOpen}
          onClose={() => setIsAddWordModalOpen(false)}
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
