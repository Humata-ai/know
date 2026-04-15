'use client'

interface PropertyTypeSelectorProps {
  onSelect: (type: 'region' | 'point') => void
  onClose: () => void
}

export default function PropertyTypeSelector({ onSelect, onClose }: PropertyTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Choose the type of property to create:
      </p>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelect('region')}
          className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div className="text-lg font-semibold mb-2">Region</div>
          <div className="text-sm text-gray-600">
            Define a range for each dimension
          </div>
        </button>
        <button
          type="button"
          onClick={() => onSelect('point')}
          className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div className="text-lg font-semibold mb-2">Point</div>
          <div className="text-sm text-gray-600">
            Define a single value for each dimension
          </div>
        </button>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
