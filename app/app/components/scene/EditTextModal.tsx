'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '../common/Modal'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useQualityDomain } from '@/app/store'
import { actions } from '@/app/store'

interface EditTextModalProps {
  isOpen: boolean
  onClose: () => void
  currentText: string
}

export default function EditTextModal({ isOpen, onClose, currentText }: EditTextModalProps) {
  const [text, setText] = useState(currentText)
  const router = useRouter()
  const { dispatch } = useQualityDomain()

  // Update local state when currentText changes
  useEffect(() => {
    setText(currentText)
  }, [currentText])

  const handleSubmit = () => {
    // Save text to state
    dispatch(actions.setInspectText(text))
    
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
        minRows={4}
        maxRows={12}
        fullWidth
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            fontSize: { xs: '0.95rem', sm: '1rem' },
          },
        }}
      />
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button
          onClick={handleCancel}
          variant="outlined"
          fullWidth
          sx={{ textTransform: 'none', display: { sm: 'inline-flex' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          sx={{ textTransform: 'none', display: { sm: 'inline-flex' } }}
        >
          Update
        </Button>
      </div>
    </Modal>
  )
}
