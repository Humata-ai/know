'use client'

import Modal from '@/app/components/common/Modal'
import PropertyTypeSelector from './PropertyTypeSelector'
import RegionDimensionForm from './RegionDimensionForm'
import PointDimensionForm from './PointDimensionForm'
import usePropertyForm from './usePropertyForm'

interface PropertyModalProps {
  isOpen: boolean
  domainId: string | null
  editingPropertyId: string | null
  onClose: () => void
  /** When true, operates on library state instead of scene state */
  useLibraryState?: boolean
}

export default function PropertyModal({
  isOpen,
  domainId,
  editingPropertyId,
  onClose,
  useLibraryState = false,
}: PropertyModalProps) {
  const {
    name,
    setName,
    propertyType,
    setPropertyType,
    regionDimensions,
    pointDimensions,
    errors,
    isGenerating,
    domain,
    editingProperty,
    handleRegionRangeChange,
    handlePointValueChange,
    handleGenerate,
    handleSubmit,
  } = usePropertyForm({ isOpen, domainId, editingPropertyId, useLibraryState })

  if (!isOpen || !domain) return null

  const showTypeSelection = !editingProperty && !propertyType
  const showForm = editingProperty || propertyType

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProperty ? 'Edit property' : 'Create property'}
      loading={isGenerating}
    >
      {showTypeSelection && (
        <PropertyTypeSelector
          onSelect={setPropertyType}
          onClose={onClose}
        />
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onClose)} className="space-y-4">
          {editingProperty && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <div className="text-sm font-medium text-blue-900">
                Type: {editingProperty.type === 'region' ? 'Region' : 'Point'}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="property-name" className="block text-sm font-medium mb-1">
              Property name <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              id="property-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Red, Heavy, Bright"
            />
          </div>

          {propertyType === 'region' && (
            <RegionDimensionForm
              domainName={domain.name}
              dimensions={domain.dimensions}
              regionDimensions={regionDimensions}
              onRangeChange={handleRegionRangeChange}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              propertyName={name}
            />
          )}

          {propertyType === 'point' && (
            <PointDimensionForm
              domainName={domain.name}
              dimensions={domain.dimensions}
              pointDimensions={pointDimensions}
              onValueChange={handlePointValueChange}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              propertyName={name}
            />
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <ul className="text-sm text-red-800 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingProperty ? 'Update property' : 'Save property'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
