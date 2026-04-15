'use client'

import { useState } from 'react'
import { useQualityDomain } from '@/app/store'
import type { ConceptInstance } from '../shared/types'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'

interface InstanceCardProps {
  instance: ConceptInstance
  onEdit: (instanceId: string) => void
  isSelected: boolean
}

export default function InstanceCard({ instance, onEdit, isSelected }: InstanceCardProps) {
  const { state, deleteInstance, selectInstance } = useQualityDomain()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectInstance(instance.id)
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
    onEdit(instance.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleMenuClose()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteInstance(instance.id)
    setShowDeleteConfirm(false)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  // Get point information for display
  const getPointInfo = () => {
    return instance.pointRefs.map(ref => {
      const domain = state.scene.domains.find(d => d.id === ref.domainId)
      if (!domain) return null

      const point = domain.properties.find(l => l.id === ref.pointId)
      if (!point) return null

      return {
        domainName: domain.name,
        pointName: point.name,
      }
    }).filter(Boolean)
  }

  const pointInfo = getPointInfo()

  return (
    <div
      onClick={handleClick}
      className={`p-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-100 border-2 border-blue-500'
          : 'bg-white border border-gray-300 hover:bg-gray-50'
      }`}
    >
      {showDeleteConfirm ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-red-600">Delete this instance?</p>
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
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{instance.name}</h3>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                isSelected
                  ? 'bg-blue-200 text-blue-700'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {pointInfo.length} {pointInfo.length === 1 ? 'point' : 'points'} selected
              </span>
            </div>
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
          <div className="space-y-1">
            {pointInfo.map((info, index) => (
              <div key={index} className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                <span className="font-medium">{info?.domainName}:</span>{' '}
                <span>{info?.pointName}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
