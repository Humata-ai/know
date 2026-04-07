'use client'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import TroubleshootIcon from '@mui/icons-material/Troubleshoot'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import type { SidebarView } from './types'

interface TabConfig {
  id: SidebarView
  label: string
  icon: React.ReactNode
}

const TABS: TabConfig[] = [
  { id: 'inspect', label: 'Inspect', icon: <TroubleshootIcon fontSize="small" /> },
  { id: 'library', label: 'Library', icon: <CollectionsBookmarkIcon fontSize="small" /> },
  { id: 'import-export', label: 'Import / Export', icon: <ImportExportIcon fontSize="small" /> },
]

interface SidebarTabStripProps {
  activeTab: SidebarView | null
  onTabClick: (tab: SidebarView) => void
}

export default function SidebarTabStrip({ activeTab, onTabClick }: SidebarTabStripProps) {
  return (
    <div
      className="h-full flex flex-col items-center py-2 gap-1"
      style={{
        width: 48,
        backgroundColor: 'rgba(245, 245, 245, 0.98)',
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {TABS.map((tab) => (
        <Tooltip key={tab.id} title={tab.label} placement="right">
          <IconButton
            onClick={() => onTabClick(tab.id)}
            sx={{
              borderRadius: 1,
              width: 40,
              height: 40,
              backgroundColor: activeTab === tab.id ? 'primary.main' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'text.secondary',
              '&:hover': {
                backgroundColor: activeTab === tab.id ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            {tab.icon}
          </IconButton>
        </Tooltip>
      ))}
    </div>
  )
}
