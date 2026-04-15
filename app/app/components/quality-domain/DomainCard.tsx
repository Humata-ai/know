'use client'

import { useState } from 'react'
import { useQualityDomain } from '@/app/store'
import type { QualityDomain } from '../shared/types'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'

interface DomainCardProps {
  domain: QualityDomain
  isSelected: boolean
  onEdit: (domainId: string) => void
  children?: React.ReactNode
}

export default function DomainCard({ domain, isSelected, onEdit, children }: DomainCardProps) {
  const { selectDomain, deleteDomain } = useQualityDomain()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = () => {
    selectDomain(domain.id)
  }

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleMenuClose()
    onEdit(domain.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleMenuClose()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteDomain(domain.id)
    setShowDeleteConfirm(false)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  const getDimensionLabel = () => {
    const count = domain.dimensions.length
    if (count === 0) return '0D'
    if (count === 1) return '1D'
    if (count === 2) return '2D'
    if (count === 3) return '3D'
    return `${count}D`
  }

  return (
    <div
      onClick={handleClick}
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-100 border-2 border-blue-500'
          : 'bg-white border border-gray-300 hover:bg-gray-50'
      }`}
    >
      {showDeleteConfirm ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-red-600">Delete this domain?</p>
          <div className="flex gap-2">
            <button
              onClick={confirmDelete}
              className="flex-1 px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={cancelDelete}
              className="flex-1 px-2 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{domain.name}</h3>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                {getDimensionLabel()}
              </span>
              <span className="px-2 py-0.5 bg-green-200 text-green-700 text-xs rounded-full font-medium">
                {domain.properties.length} {domain.properties.length === 1 ? 'label' : 'labels'}
              </span>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                aria-label="more options"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
              </Menu>
            </div>
          </div>
          {children && (
            <div className="mt-3 pt-3 border-t border-blue-300">
              {children}
            </div>
          )}
        </>
      )}
    </div>
  )
}
