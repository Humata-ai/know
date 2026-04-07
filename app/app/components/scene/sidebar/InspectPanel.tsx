'use client'

import { useState } from 'react'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import QualityDomainsSection from './QualityDomainsSection'
import ConceptsSection from './ConceptsSection'
import TimelinePanel from '../TimelinePanel'
import EventModal from '../EventModal'

type InspectSubView = 'state' | 'timeline'

export default function InspectPanel() {
  const [subView, setSubView] = useState<InspectSubView>('state')
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <Typography variant="subtitle1" fontWeight="bold">
          Inspect
        </Typography>
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
    </div>
  )
}
