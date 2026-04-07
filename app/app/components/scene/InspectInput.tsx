'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import NorthIcon from '@mui/icons-material/North'

const DEFAULT_TEXT = 'Mary had a little lamb, Its fleece was white as snow.'

export default function InspectInput() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const router = useRouter()

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleSubmit = () => {
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
    <div className="fixed inset-0 w-full h-screen flex items-center justify-center bg-gray-50" style={{ zIndex: 10 }}>
      <div className="w-full max-w-2xl px-8">
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
                borderRadius: '16px',
                fontSize: '1.125rem',
                paddingRight: '64px',
              },
            }}
          />
          <IconButton
            onClick={handleSubmit}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              backgroundColor: 'primary.main',
              color: 'white',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              width: 48,
              height: 48,
            }}
          >
            <NorthIcon />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
