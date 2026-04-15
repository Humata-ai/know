'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/app/store'
import { isRegion } from '../../../shared/types'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import EditIcon from '@mui/icons-material/Edit'
import { useState } from 'react'
import PropertyModal from '../../../quality-domain/PropertyModal'

export default function PropertyDetailView({ propertyId }: { propertyId: string }) {
  const { state, deleteLibraryProperty } = useAppStore()
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Find the property (label) across all domains
  let foundProperty: { label: any; domain: any } | null = null
  for (const domain of state.library.domains) {
    const label = domain.labels.find((l) => l.id === propertyId)
    if (label) {
      foundProperty = { label, domain }
      break
    }
  }

  if (!foundProperty) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p className="text-sm">Property not found.</p>
      </div>
    )
  }

  const { label, domain } = foundProperty
  const typeLabel = isRegion(label) ? 'Region' : 'Point'

  const handleDelete = () => {
    deleteLibraryProperty(domain.id, label.id)
    router.push('/library/properties')
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  return (
    <>
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
            {typeLabel}
          </span>
          <Tooltip title="Edit Property">
            <Button
              onClick={handleEdit}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ minWidth: 0, p: 0.5 }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Domain</h4>
          <p className="text-sm text-gray-700">{domain.name}</p>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Dimensions</h4>
          <div className="space-y-2">
            {label.dimensions.map((d: any) => {
              const dimension = domain.dimensions.find((dim: any) => dim.id === d.dimensionId)
              if (!dimension) return null
              return (
                <div key={d.dimensionId} className="text-sm">
                  <span className="font-medium text-gray-700">{dimension.name}:</span>{' '}
                  <span className="font-mono text-gray-600">
                    {'range' in d
                      ? `[${d.range[0]}, ${d.range[1]}]`
                      : d.value
                    }
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Added</h4>
          <p className="text-sm text-gray-700">{label.createdAt.toLocaleDateString()}</p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleDelete}
            className="text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            Delete property
          </button>
        </div>
      </div>
      
      <PropertyModal
        isOpen={isEditModalOpen}
        domainId={domain.id}
        editingPropertyId={label.id}
        onClose={() => setIsEditModalOpen(false)}
        useLibraryState
      />
    </>
  )
}
