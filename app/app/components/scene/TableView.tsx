'use client'

import type { QualityDomain } from '../shared/types'
import { isRegion, isPoint } from '../shared/types'

interface TableViewProps {
  domain: QualityDomain
}

export default function TableView({ domain }: TableViewProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto pointer-events-auto">
        <h2 className="text-2xl font-bold mb-4">{domain.name}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {domain.dimensions.length}-dimensional space (table view)
        </p>

        {/* Domain dimensions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Dimensions</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Range</th>
                </tr>
              </thead>
              <tbody>
                {domain.dimensions.map((dimension, index) => (
                  <tr
                    key={dimension.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 border-b border-gray-200 font-medium">
                      {dimension.name}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      [{dimension.range[0]}, {dimension.range[1]}]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Labels */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Labels ({domain.properties.length})
          </h3>
          {domain.properties.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No labels in this domain</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Type</th>
                    {domain.dimensions.map((dimension) => (
                      <th key={dimension.id} className="px-4 py-2 text-left font-semibold">
                        {dimension.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {domain.properties.map((property, index) => (
                    <tr
                      key={property.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-3 border-b border-gray-200 font-medium">
                        {property.name || '(unnamed)'}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <span className={`px-2 py-1 text-xs rounded ${
                          isRegion(property)
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {isRegion(property) ? 'Region' : 'Point'}
                        </span>
                      </td>
                      {domain.dimensions.map((dimension) => {
                        const propertyDim = property.dimensions.find(
                          (d) => d.dimensionId === dimension.id
                        )

                        if (!propertyDim) {
                          return (
                            <td key={dimension.id} className="px-4 py-3 border-b border-gray-200 text-gray-400">
                              -
                            </td>
                          )
                        }

                        if ('range' in propertyDim) {
                          // For regions, show range
                          return (
                            <td key={dimension.id} className="px-4 py-3 border-b border-gray-200">
                              [{propertyDim.range[0]}, {propertyDim.range[1]}]
                            </td>
                          )
                        } else {
                          // For points, show single value
                          return (
                            <td key={dimension.id} className="px-4 py-3 border-b border-gray-200">
                              {propertyDim.value}
                            </td>
                          )
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
