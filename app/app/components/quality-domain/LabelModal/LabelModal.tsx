'use client'

import Modal from '@/app/components/common/Modal'
import LabelTypeSelector from './LabelTypeSelector'
import RegionDimensionForm from './RegionDimensionForm'
import PointDimensionForm from './PointDimensionForm'
import useLabelForm from './useLabelForm'

interface LabelModalProps {
  isOpen: boolean
  domainId: string | null
  editingLabelId: string | null
  onClose: () => void
  /** When true, operates on library state instead of scene state */
  useLibraryState?: boolean
}

export default function LabelModal({
  isOpen,
  domainId,
  editingLabelId,
  onClose,
  useLibraryState = false,
}: LabelModalProps) {
  const {
    name,
    setName,
    labelType,
    setLabelType,
    regionDimensions,
    pointDimensions,
    errors,
    isGenerating,
    domain,
    editingLabel,
    handleRegionRangeChange,
    handlePointValueChange,
    handleGenerate,
    handleSubmit,
  } = useLabelForm({ isOpen, domainId, editingLabelId, useLibraryState })

  if (!isOpen || !domain) return null

  const showTypeSelection = !editingLabel && !labelType
  const showForm = editingLabel || labelType

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingLabel ? 'Edit label' : 'Create label'}
      loading={isGenerating}
    >
      {showTypeSelection && (
        <LabelTypeSelector
          onSelect={setLabelType}
          onClose={onClose}
        />
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onClose)} className="space-y-4">
          {editingLabel && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <div className="text-sm font-medium text-blue-900">
                Type: {editingLabel.type === 'region' ? 'Region' : 'Point'}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="label-name" className="block text-sm font-medium mb-1">
              Label name <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              id="label-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Red, Heavy, Bright"
            />
          </div>

          {labelType === 'region' && (
            <RegionDimensionForm
              domainName={domain.name}
              dimensions={domain.dimensions}
              regionDimensions={regionDimensions}
              onRangeChange={handleRegionRangeChange}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              labelName={name}
            />
          )}

          {labelType === 'point' && (
            <PointDimensionForm
              domainName={domain.name}
              dimensions={domain.dimensions}
              pointDimensions={pointDimensions}
              onValueChange={handlePointValueChange}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              labelName={name}
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
              {editingLabel ? 'Update label' : 'Save label'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
