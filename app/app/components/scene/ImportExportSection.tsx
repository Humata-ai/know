'use client'

import { useState, useRef, useCallback } from 'react'
import { useQualityDomain } from '@/app/store'
import { DataParser } from '@/app/utils/dataParser'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import DownloadIcon from '@mui/icons-material/Download'
import UploadFileIcon from '@mui/icons-material/UploadFile'

type ExportType = 'library' | 'scene'

/**
 * Exported file format discriminator.
 * - "library": contains library state (concepts, domains).
 * - "scene": contains scene state (domains, concepts, instances) AND library state.
 */
interface ExportEnvelope {
  exportType: ExportType
  version: number
  [key: string]: unknown
}

const EXPORT_VERSION = 1

export default function ImportExportSection() {
  const { state, dispatch } = useQualityDomain()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---------- helpers ----------

  const infinityReplacer = (_key: string, value: unknown) => {
    if (value === Infinity) return 'Infinity'
    if (value === -Infinity) return '-Infinity'
    return value
  }

  // ---------- export ----------

  const buildExportPayload = (type: ExportType): string => {
    if (type === 'library') {
      const payload: ExportEnvelope = {
        exportType: 'library',
        version: EXPORT_VERSION,
        libraryConcepts: state.library.concepts,
        libraryDomains: state.library.domains,
      }
      return JSON.stringify(payload, infinityReplacer, 2)
    }

    const payload: ExportEnvelope = {
      exportType: 'scene',
      version: EXPORT_VERSION,
      domains: state.scene.domains,
      concepts: state.scene.concepts,
      instances: state.scene.instances,
      libraryConcepts: state.library.concepts,
      libraryDomains: state.library.domains,
    }
    return JSON.stringify(payload, infinityReplacer, 2)
  }

  const handleDownload = (type: ExportType) => {
    try {
      const json = buildExportPayload(type)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conceptslm-${type}-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSuccess(`${type === 'library' ? 'Library' : 'Scene'} state downloaded!`)
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to download: ${errorMessage}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  // ---------- validation ----------

  const validateConcepts = (concepts: unknown): boolean => {
    if (!Array.isArray(concepts)) {
      setError("Invalid state: 'concepts' must be an array")
      return false
    }
    for (let i = 0; i < concepts.length; i++) {
      const c = concepts[i]
      if (!c || typeof c !== 'object') {
        setError(`Invalid concept at index ${i}: must be an object`)
        return false
      }
      if (!c.id || typeof c.id !== 'string') {
        setError(`Invalid concept at index ${i}: missing or invalid 'id'`)
        return false
      }
      if (!c.name || typeof c.name !== 'string') {
        setError(`Invalid concept at index ${i}: missing or invalid 'name'`)
        return false
      }
    }
    return true
  }

  const validateDomains = (domains: unknown): boolean => {
    if (!Array.isArray(domains)) {
      setError("Invalid state: missing 'domains' array")
      return false
    }

    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i]

      if (!domain.id || typeof domain.id !== 'string') {
        setError(`Invalid domain at index ${i}: missing or invalid 'id'`)
        return false
      }

      if (!domain.name || typeof domain.name !== 'string') {
        setError(`Invalid domain at index ${i}: missing or invalid 'name'`)
        return false
      }

      if (!Array.isArray(domain.dimensions)) {
        setError(`Invalid domain at index ${i}: 'dimensions' must be an array`)
        return false
      }

      if (!domain.createdAt) {
        setError(`Invalid domain at index ${i}: missing 'createdAt'`)
        return false
      }

      for (let j = 0; j < domain.dimensions.length; j++) {
        const dim = domain.dimensions[j]

        if (!dim.id || typeof dim.id !== 'string') {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: missing or invalid 'id'`)
          return false
        }

        if (!dim.name || typeof dim.name !== 'string') {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: missing or invalid 'name'`)
          return false
        }

        if (!Array.isArray(dim.range) || dim.range.length !== 2) {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: 'range' must be an array of 2 values`)
          return false
        }

        const isValidRangeValue = (val: unknown) =>
          typeof val === 'number' || val === 'Infinity' || val === '-Infinity'

        if (!isValidRangeValue(dim.range[0]) || !isValidRangeValue(dim.range[1])) {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: 'range' values must be numbers or "Infinity"`)
          return false
        }

        const min = dim.range[0] === 'Infinity' ? Infinity : dim.range[0] === '-Infinity' ? -Infinity : dim.range[0]
        const max = dim.range[1] === 'Infinity' ? Infinity : dim.range[1] === '-Infinity' ? -Infinity : dim.range[1]

        if (min >= max) {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: range[0] must be less than range[1]`)
          return false
        }
      }
    }

    return true
  }

  // ---------- deserialization helpers ----------

  // Use centralized parsing utilities
  const parseDomains = DataParser.parseDomains
  const parseConcepts = DataParser.parseConcepts
  const parseInstances = DataParser.parseInstances

  // ---------- import ----------

  const importFromJson = (jsonString: string) => {
    setError(null)
    setSuccess(null)

    try {
      const parsed = JSON.parse(jsonString)

      if (!parsed || typeof parsed !== 'object') {
        setError('Invalid JSON: must be an object')
        return
      }

      const detectedType: ExportType = parsed.exportType === 'library'
        ? 'library'
        : parsed.exportType === 'scene'
          ? 'scene'
          // Legacy files (before exportType was added) are treated as scene exports
          // if they have a 'domains' key, otherwise fall back based on heuristics
          : parsed.domains !== undefined
            ? 'scene'
            // Check for the old nested scene/library structure from localStorage
            : parsed.scene !== undefined
              ? 'scene'
              : 'scene' // default

      if (detectedType === 'library') {
        // --- Library-only import ---
        const rawLibConcepts = parsed.libraryConcepts || []
        const rawLibDomains = parsed.libraryDomains || []
        if (!validateConcepts(rawLibConcepts)) return

        const libConcepts = parseConcepts(rawLibConcepts)
        const libDomains = rawLibDomains.length > 0 ? parseDomains(rawLibDomains) : state.library.domains
        dispatch({ type: 'RESTORE_LIBRARY_STATE', payload: { dictionaryWords: [], concepts: libConcepts, domains: libDomains } })

        setSuccess(`Library state imported successfully! (${libConcepts.length} concept${libConcepts.length !== 1 ? 's' : ''})`)
        setTimeout(() => setSuccess(null), 3000)
        return
      }

      // --- Scene import (includes library) ---
      // Support both new flat format and old nested scene/library format
      let rawDomains: any[]
      let rawConcepts: any[]
      let rawInstances: any[]
      let rawLibConcepts: any[]
      let rawLibDomains: any[]

      if (parsed.scene) {
        // Old localStorage/StateDebugPanel format
        rawDomains = parsed.scene.domains || []
        rawConcepts = parsed.scene.concepts || []
        rawInstances = parsed.scene.instances || []
        rawLibConcepts = parsed.library?.concepts || []
        rawLibDomains = parsed.library?.domains || rawDomains
      } else {
        // New flat format
        rawDomains = parsed.domains || []
        rawConcepts = parsed.concepts || []
        rawInstances = parsed.instances || []
        rawLibConcepts = parsed.libraryConcepts || []
        rawLibDomains = parsed.libraryDomains || rawDomains
      }

      if (!validateDomains(rawDomains)) return

      const domains = parseDomains(rawDomains)
      const concepts = parseConcepts(rawConcepts)
      const instances = parseInstances(rawInstances)
      const libConcepts = parseConcepts(rawLibConcepts)
      const libDomains = parseDomains(rawLibDomains)

      dispatch({
        type: 'RESTORE_SCENE_STATE',
        payload: { domains, concepts, instances },
      })
      dispatch({
        type: 'RESTORE_LIBRARY_STATE',
        payload: { dictionaryWords: [], concepts: libConcepts, domains: libDomains },
      })

      const parts: string[] = []
      parts.push(`${domains.length} domain${domains.length !== 1 ? 's' : ''}`)
      parts.push(`${concepts.length} concept${concepts.length !== 1 ? 's' : ''}`)
      parts.push(`${instances.length} instance${instances.length !== 1 ? 's' : ''}`)
      setSuccess(`Scene state imported successfully! (${parts.join(', ')})`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError(`Invalid JSON syntax: ${err.message}`)
      } else {
        setError(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  // ---------- file handling ----------

  const handleFileRead = useCallback((file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setError('Please upload a JSON file')
      setTimeout(() => setError(null), 5000)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        importFromJson(text)
      }
    }
    reader.onerror = () => {
      setError('Failed to read file')
      setTimeout(() => setError(null), 5000)
    }
    reader.readAsText(file)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, dispatch])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileRead(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileRead(file)
    }
  }

  // ---------- render ----------

  return (
    <Box sx={{ px: 2, py: 2 }}>
      {/* Status Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Export */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Export
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        <Button
          onClick={() => handleDownload('scene')}
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{ textTransform: 'none' }}
        >
          Export Scene
        </Button>
        <Button
          onClick={() => handleDownload('library')}
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{ textTransform: 'none' }}
        >
          Export Library
        </Button>
      </Box>

      {/* Import */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        Import State
      </Typography>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1, lineHeight: 1.3 }}>
        The import type is detected automatically from the file contents.
      </Typography>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {/* Drop zone */}
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: isDragOver ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragOver ? 'primary.50' : 'grey.50',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.light',
            bgcolor: 'grey.100',
          },
        }}
      >
        <UploadFileIcon sx={{ fontSize: 32, color: isDragOver ? 'primary.main' : 'grey.400', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Drag & drop a JSON file here
        </Typography>
        <Typography variant="caption" color="text.disabled">
          or click to browse
        </Typography>
      </Box>
    </Box>
  )
}
