'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import EditIcon from '@mui/icons-material/Edit'
import QualityDomainsSection from './QualityDomainsSection'
import ConceptsSection from './ConceptsSection'
import TimelinePanel from '../TimelinePanel'
import EventModal from '../EventModal'
import EditTextModal from '../EditTextModal'

type InspectSubView = 'state' | 'timeline'

export default function InspectPanel() {
  const [subView, setSubView] = useState<InspectSubView>('state')
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isEditTextModalOpen, setIsEditTextModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const currentText = searchParams.get('txt') || ''

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <Typography variant="subtitle1" fontWeight="bold">
          Inspect
        </Typography>
        <div className="flex items-center gap-2">
          <Tooltip title="Edit">
            <IconButton
              onClick={() => setIsEditTextModalOpen(true)}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {subView === 'timeline' && (
            <Button
              onClick={() => setIsEventModalOpen(true)}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Add Event
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 py-2 border-b border-gray-200 flex justify-center">
        <ToggleButtonGroup
          value={subView}
          exclusive
          onChange={(_, value) => {
            if (value !== null) setSubView(value)
          }}
          size="small"
          sx={{ width: '100%' }}
        >
          <ToggleButton value="state" sx={{ flex: 1, textTransform: 'none', py: 0.5 }}>
            State
          </ToggleButton>
          <ToggleButton value="timeline" sx={{ flex: 1, textTransform: 'none', py: 0.5 }}>
            Timeline
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div className="flex-1 overflow-y-auto">
        {subView === 'state' && (
          <>
            <QualityDomainsSection />
            <ConceptsSection />
          </>
        )}
        {subView === 'timeline' && <TimelinePanel />}
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
      <EditTextModal
        isOpen={isEditTextModalOpen}
        onClose={() => setIsEditTextModalOpen(false)}
        currentText={decodeURIComponent(currentText)}
      />
    </div>
  )
}
