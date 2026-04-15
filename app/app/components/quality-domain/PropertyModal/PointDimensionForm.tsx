'use client'

import type { PointDimensionValue, QualityDimension } from '../../shared/types'
import AiFillButton from './AiFillButton'

interface PointDimensionFormProps {
  domainName: string
  dimensions: QualityDimension[]
  pointDimensions: PointDimensionValue[]
  onValueChange: (dimensionId: string, value: number) => void
  onGenerate: () => void
  isGenerating: boolean
  propertyName: string
}

export default function PointDimensionForm({
  domainName,
  dimensions,
  pointDimensions,
  onValueChange,
  onGenerate,
  isGenerating,
  propertyName,
}: PointDimensionFormProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">
          Dimension values (Domain: {domainName})
        </label>
        <AiFillButton
          onClick={onGenerate}
          disabled={isGenerating || !propertyName.trim()}
        />
      </div>
      <div className="space-y-3">
        {pointDimensions.map((pd) => {
          const dimension = dimensions.find((d) => d.id === pd.dimensionId)
          if (!dimension) return null

          return (
            <div key={pd.dimensionId} className="border border-gray-200 rounded p-3">
              <div className="text-sm font-medium mb-2">{dimension.name}</div>
              <div className="text-xs text-gray-500 mb-2">
                Domain range: [{dimension.range[0]}, {dimension.range[1]}]
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Value</label>
                <input
                  type="number"
                  value={pd.value}
                  onChange={(e) =>
                    onValueChange(pd.dimensionId, parseFloat(e.target.value))
                  }
                  step="any"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
