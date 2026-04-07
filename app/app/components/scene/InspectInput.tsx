'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import NorthIcon from '@mui/icons-material/North'
import { useQualityDomain } from '@/app/store'

const DEFAULT_TEXT = 'Mary had a little lamb, Its fleece was white as snow.'

export default function InspectInput() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { state } = useQualityDomain()

  const validateText = (inputText: string): Set<string> => {
    const words = inputText
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
    
    const dictionaryWords = new Set(
      state.library.dictionaryWords.map(w => w.name.toLowerCase())
    )
    
    const invalidWords = new Set<string>()
    words.forEach(word => {
      if (!dictionaryWords.has(word)) {
        invalidWords.add(word)
      }
    })
    
    return invalidWords
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    
    // Validate on change
    const invalidWords = validateText(newText)
    setErrors(invalidWords)
  }

  const handleSubmit = () => {
    const invalidWords = validateText(text)
    
    if (invalidWords.size > 0) {
      setErrors(invalidWords)
      return
    }
    
    // Navigate to inspect page with query parameter
    const encodedText = encodeURIComponent(text)
    router.push(`/inspect?txt=${encodedText}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  // Highlight invalid words in the textarea
  const getHighlightedText = () => {
    if (errors.size === 0) return null
    
    const words = text.split(/(\s+|[.,!?;:])/)
    return words.map((segment, index) => {
      const cleanWord = segment.toLowerCase().replace(/[.,!?;:]/g, '')
      const isError = errors.has(cleanWord)
      return (
        <span
          key={index}
          style={{
            color: isError ? 'red' : 'inherit',
            textDecoration: isError ? 'underline wavy red' : 'none',
          }}
        >
          {segment}
        </span>
      )
    })
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
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
        {errors.size > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold mb-2">
              The following words are not in the dictionary:
            </p>
            <ul className="list-disc list-inside text-red-700">
              {Array.from(errors).map(word => (
                <li key={word}>{word}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
