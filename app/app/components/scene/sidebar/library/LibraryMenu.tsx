'use client'

import Typography from '@mui/material/Typography'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import CategoryIcon from '@mui/icons-material/Category'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import TuneIcon from '@mui/icons-material/Tune'
import LabelIcon from '@mui/icons-material/Label'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { LIBRARY_SECTION_LABELS } from '../types'
import type { LibrarySection } from '../types'

const LIBRARY_MENU_ITEMS: { section: LibrarySection; icon: React.ReactNode }[] = [
  { section: 'dictionary', icon: <MenuBookIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'concepts', icon: <BubbleChartIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'actions', icon: <PlayArrowIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'quality-domains', icon: <CategoryIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'quality-dimensions', icon: <TuneIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
  { section: 'properties', icon: <LabelIcon fontSize="small" sx={{ color: 'text.secondary' }} /> },
]

export default function LibraryMenu({ onNavigate }: { onNavigate: (section: LibrarySection) => void }) {
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
