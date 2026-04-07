'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '../common/Modal'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

interface EditTextModalProps {
  isOpen: boolean
  onClose: () => void
  currentText: string
}

export default function EditTextModal({ isOpen, onClose, currentText }: EditTextModalProps) {
  const [text, setText] = useState(currentText)
  const router = useRouter()

  // Update local state when currentText changes
  useEffect(() => {
    setText(currentText)
  }, [currentText])

  const handleSubmit = () => {
    const encodedText = encodeURIComponent(text)
    router.push(`/inspect?txt=${encodedText}`)
    onClose()
  }

  const handleCancel = () => {
    setText(currentText) // Reset to original text
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Edit Text" maxWidth="lg">
      <TextField
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to inspect..."
        multiline
        rows={6}
        fullWidth
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            fontSize: '1rem',
          },
        }}
      />
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ textTransform: 'none' }}
        >
          Update
        </Button>
      </div>
    </Modal>
  )
}
