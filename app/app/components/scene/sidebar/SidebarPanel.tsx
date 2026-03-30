'use client'

import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

interface SidebarPanelProps {
  title: string
  children: React.ReactNode
  headerAction?: React.ReactNode
  onBack?: () => void
}

export default function SidebarPanel({ title, children, headerAction, onBack }: SidebarPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0">
          {onBack && (
            <IconButton
              size="small"
              onClick={onBack}
              sx={{ color: 'text.secondary', mr: 0.5, flexShrink: 0 }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {title}
          </Typography>
        </div>
        {headerAction && <div className="flex-shrink-0 ml-2">{headerAction}</div>}
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
