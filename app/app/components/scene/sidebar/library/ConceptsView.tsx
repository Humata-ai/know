'use client'

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAppStore } from '@/app/store'

export default function ConceptsView({
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
