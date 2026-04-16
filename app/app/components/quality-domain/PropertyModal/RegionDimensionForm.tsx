'use client'

import type { PropertyDimensionRange, QualityDimension } from '../../shared/types'
import LinearValueRange from '../LinearValueRange'
import AiFillButton from './AiFillButton'

interface RegionDimensionFormProps {
  domainName: string
  dimensions: QualityDimension[]
  regionDimensions: PropertyDimensionRange[]
  onRangeChange: (dimensionId: string, field: 'min' | 'max', value: number) => void
  onGenerate: () => void
  isGenerating: boolean
  propertyName: string
}

export default function RegionDimensionForm({
  domainName,
  dimensions,
  regionDimensions,
  onRangeChange,
  onGenerate,
  isGenerating,
  propertyName,
}: RegionDimensionFormProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">
          Dimension ranges (Domain: {domainName})
        </label>
        <AiFillButton
          onClick={onGenerate}
          disabled={isGenerating || !propertyName.trim()}
        />
      </div>
      <div className="space-y-3">
        {regionDimensions.map((dr) => {
          const dimension = dimensions.find((d) => d.id === dr.dimensionId)
          if (!dimension) return null

          return (
            <div key={dr.dimensionId} className="border border-gray-200 rounded p-3">
              <div className="text-sm font-medium mb-1">{dimension.name}</div>
              <div className="text-xs text-gray-500 mb-2">
                Domain range: [{dimension.range[0]}, {dimension.range[1]}]
              </div>
              <LinearValueRange
                min={dr.range[0]}
                max={dr.range[1]}
                onMinChange={(value) => onRangeChange(dr.dimensionId, 'min', value)}
                onMaxChange={(value) => onRangeChange(dr.dimensionId, 'max', value)}
                allowMinInfinity={dimension.range[0] === -Infinity}
                allowMaxInfinity={dimension.range[1] === Infinity}
                label=""
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
