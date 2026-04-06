'use client'

import { useState } from 'react'
import { useQualityDomain } from '@/app/store'
import type { Concept } from '../shared/types'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import InstanceModal from './InstanceModal'
import InstanceCard from './InstanceCard'

interface ConceptCardProps {
  concept: Concept
  onEdit: (conceptId: string) => void
  isSelected: boolean
}

export default function ConceptCard({ concept, onEdit, isSelected }: ConceptCardProps) {
  const { state, deleteConcept, getConceptLabels, getConceptInstances, selectConcept } = useQualityDomain()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false)
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null)
  const open = Boolean(anchorEl)

  const labels = getConceptLabels(concept.id)
  const instances = getConceptInstances(concept.id)

  // Concept is expanded if it's selected (either directly or via an instance)
  const isExpanded = state.scene.selectedConceptId === concept.id

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectConcept(concept.id)
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
    onEdit(concept.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleMenuClose()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteConcept(concept.id)
    setShowDeleteConfirm(false)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  const handleAddInstance = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleMenuClose()
    setEditingInstanceId(null)
    setIsInstanceModalOpen(true)
  }

  const handleEditInstance = (instanceId: string) => {
    setEditingInstanceId(instanceId)
    setIsInstanceModalOpen(true)
  }

  const handleCloseInstanceModal = () => {
    setIsInstanceModalOpen(false)
    setEditingInstanceId(null)
  }

  return (
    <>
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
          <p className="text-sm font-medium text-red-600">Delete this concept?</p>
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
              <h3 className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{concept.name}</h3>
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                isSelected
                  ? 'bg-blue-200 text-blue-700'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {labels.length} {labels.length === 1 ? 'label' : 'labels'}
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
          {labels.length > 0 && (
            <div className={`mt-2 text-xs ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
              {labels.map((label, index) => (
                <span key={label.id}>
                  {label.name || '(unnamed)'}
                  {index < labels.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}

          {isExpanded && (
            <div className="mt-4 border-t pt-3">
              {instances.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-xs">No instances yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {instances.map(instance => (
                    <InstanceCard
                      key={instance.id}
                      instance={instance}
                      onEdit={handleEditInstance}
                      isSelected={state.scene.selectedInstanceId === instance.id}
                    />
                  ))}
                </div>
              )}
              <Button
                onClick={handleAddInstance}
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Create Instance
              </Button>
            </div>
          )}
        </>
      )}
    </div>

    <InstanceModal
      isOpen={isInstanceModalOpen}
      conceptId={concept.id}
      editingInstanceId={editingInstanceId}
      onClose={handleCloseInstanceModal}
    />
    </>
  )
}
