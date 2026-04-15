'use client'

import { useState } from 'react'
import { useQualityDomain } from '@/app/store'
import type { QualityDomainLabel, QualityDomain } from '../shared/types'
import { isRegion, isPoint } from '../shared/types'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'

interface PropertyCardProps {
  property: QualityDomainLabel
  domain: QualityDomain
  onEdit: (propertyId: string) => void
  isSelected: boolean
}

export default function PropertyCard({ property, domain, onEdit, isSelected }: PropertyCardProps) {
  const { deleteProperty, selectProperty } = useQualityDomain()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectProperty(domain.id, property.id)
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
    onEdit(property.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleMenuClose()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteProperty(domain.id, property.id)
    setShowDeleteConfirm(false)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  const getDimensionInfo = () => {
    return property.dimensions.map((d) => {
      const dimension = domain.dimensions.find((dim) => dim.id === d.dimensionId)
      if (!dimension) return null

      if ('range' in d) {
        return {
          name: dimension.name,
          type: 'range' as const,
          range: d.range,
        }
      } else {
        return {
          name: dimension.name,
          type: 'value' as const,
          value: d.value,
        }
      }
    }).filter(Boolean)
  }

  const dimensionInfo = getDimensionInfo()

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
          <p className="text-sm font-medium text-red-600">Delete this property?</p>
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
              {property.name && <h3 className="font-medium text-sm">{property.name}</h3>}
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                {isRegion(property) ? 'Region' : 'Point'}
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
            {dimensionInfo.map((info, index) => (
              <div key={index} className="text-xs text-gray-600">
                <span className="font-medium">{info?.name}:</span>{' '}
                <span className="font-mono">
                  {info?.type === 'range'
                    ? `[${info.range[0]}, ${info.range[1]}]`
                    : info?.value
                  }
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
