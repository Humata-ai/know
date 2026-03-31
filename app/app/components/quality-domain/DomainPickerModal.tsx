'use client'

import { useState, useMemo } from 'react'
import Modal from '@/app/components/common/Modal'
import type { QualityDomain } from '../shared/types'

interface DomainPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (domainId: string) => void
  domains: QualityDomain[]
}

export default function DomainPickerModal({
  isOpen,
  onClose,
  onSelect,
  domains,
}: DomainPickerModalProps) {
  const [search, setSearch] = useState('')

  const filteredDomains = useMemo(() => {
    if (!search.trim()) return domains
    const query = search.toLowerCase()
    return domains.filter((d) => d.name.toLowerCase().includes(query))
  }, [domains, search])

  const handleSelect = (domainId: string) => {
    setSearch('')
    onSelect(domainId)
  }

  const handleClose = () => {
    setSearch('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Select quality domain">
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search domains..."
            autoFocus
          />
        </div>

        {domains.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No quality domains in the library.</p>
            <p className="text-xs mt-1">Add a quality domain first from the Quality Domains section.</p>
          </div>
        ) : filteredDomains.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No domains match &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredDomains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => handleSelect(domain.id)}
                className="w-full p-3 rounded-lg bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors text-left"
              >
                <h3 className="font-medium">{domain.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {domain.dimensions.length}D
                  </span>
                  <span className="text-xs text-gray-500">
                    {domain.labels.length} {domain.labels.length === 1 ? 'label' : 'labels'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
