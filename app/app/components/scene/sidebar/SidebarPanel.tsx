'use client'

import Typography from '@mui/material/Typography'

export interface BreadcrumbSegment {
  label: string
  href: string
}

interface SidebarPanelProps {
  title: string
  breadcrumbs?: BreadcrumbSegment[]
  children: React.ReactNode
  headerAction?: React.ReactNode
  onNavigate?: (href: string) => void
}

export default function SidebarPanel({ title, breadcrumbs, children, headerAction, onNavigate }: SidebarPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        {breadcrumbs && breadcrumbs.length > 0 && onNavigate && (
          <div className="flex items-center gap-1 mb-0.5">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    /
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'text.primary' },
                    transition: 'color 0.15s',
                  }}
                  onClick={() => onNavigate(crumb.href)}
                >
                  {crumb.label}
                </Typography>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ minWidth: 0 }}>
            {title}
          </Typography>
          {headerAction && <div className="flex-shrink-0 ml-2">{headerAction}</div>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
