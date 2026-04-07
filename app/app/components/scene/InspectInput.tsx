'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import NorthIcon from '@mui/icons-material/North'
import { useQualityDomain } from '@/app/store'
import { actions } from '@/app/store'

const DEFAULT_TEXT = 'Mary had a little lamb, Its fleece was white as snow.'

export default function InspectInput() {
  const { state, dispatch } = useQualityDomain()
  // Initialize with state value or default, but don't update from state changes
  const [text, setText] = useState(() => state.scene.inspectText || DEFAULT_TEXT)
  const router = useRouter()

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleSubmit = () => {
    // Save text to state
    dispatch(actions.setInspectText(text))
    
    // Navigate to inspect page with query parameter
    const encodedText = encodeURIComponent(text)
    router.push(`/inspect?txt=${encodedText}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="fixed inset-0 w-full h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8" style={{ zIndex: 10 }}>
      <div className="w-full max-w-2xl">
        <div className="relative">
          <TextField
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter text to inspect..."
            multiline
            rows={6}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: '12px', sm: '16px' },
                fontSize: { xs: '1rem', sm: '1.125rem' },
                paddingRight: { xs: '56px', sm: '64px' },
                paddingBottom: { xs: '56px', sm: '16px' },
              },
              '& textarea': {
                height: '140px !important',
                overflow: 'auto !important',
              },
            }}
          />
          <IconButton
            onClick={handleSubmit}
            sx={{
              position: 'absolute',
              bottom: { xs: 8, sm: 16 },
              right: { xs: 8, sm: 16 },
              backgroundColor: 'primary.main',
              color: 'white',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
            }}
          >
            <NorthIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
