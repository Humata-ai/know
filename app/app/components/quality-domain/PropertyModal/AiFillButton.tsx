'use client'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'

interface AiFillButtonProps {
  onClick: () => void
  disabled: boolean
}

export default function AiFillButton({ onClick, disabled }: AiFillButtonProps) {
  return (
    <Tooltip title="AI Fill">
      <span>
        <Button
          onClick={onClick}
          disabled={disabled}
          color="secondary"
          variant="outlined"
          size="small"
          sx={{ minWidth: 0, p: 0.5 }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 16 }} />
        </Button>
      </span>
    </Tooltip>
  )
}
