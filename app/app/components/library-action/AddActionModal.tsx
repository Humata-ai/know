'use client'

import { useState } from 'react'
import Modal from '../common/Modal'
import { useAppStore } from '@/app/store'
import { generateId } from '../shared/utils'

interface AddActionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddActionModal({ isOpen, onClose }: AddActionModalProps) {
  const { addLibraryAction } = useAppStore()
  const [actionName, setActionName] = useState('')
  const [verbType, setVerbType] = useState<'manner' | 'result' | 'path'>('manner')

  const handleAddAction = () => {
    if (!actionName.trim()) return

    const newAction = {
      id: generateId(),
      name: actionName.trim(),
      verbType,
      createdAt: new Date(),
    }

    addLibraryAction(newAction)
    setActionName('')
    setVerbType('manner')
    onClose()
  }

  const handleClose = () => {
    setActionName('')
    setVerbType('manner')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Action"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="action-name" className="block text-sm font-medium mb-1">
            Action name
          </label>
          <input
            id="action-name"
            type="text"
            value={actionName}
            onChange={(e) => setActionName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="e.g., Run, Push, Slide"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Verb type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVerbType('manner')}
              className={`px-3 py-1.5 rounded border text-sm transition-colors ${verbType === 'manner'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Manner Verb
            </button>
            <button
              type="button"
              onClick={() => setVerbType('result')}
              className={`px-3 py-1.5 rounded border text-sm transition-colors ${verbType === 'result'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Result Verb
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddAction}
            disabled={!actionName.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Action
          </button>
        </div>
      </div>
    </Modal>
  )
}
