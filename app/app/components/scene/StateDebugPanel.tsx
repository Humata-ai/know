"use client"

import { useState } from "react"
import { useQualityDomain } from '@/app/store'
import CloseIcon from '@mui/icons-material/Close'
import CodeIcon from '@mui/icons-material/Code'

export default function StateDebugPanel() {
  const { state, dispatch } = useQualityDomain()
  const [isOpen, setIsOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Custom replacer to handle Infinity values and filter out selection state
  const formattedState = JSON.stringify(state, (key, value) => {
    // Filter out selection state
    if (key === 'selectedDomainId' ||
      key === 'selectedLabelId' ||
      key === 'selectedLabelDomainId' ||
      key === 'selectedConceptId' ||
      key === 'selectedInstanceId' ||
      key === 'selectedWordId') {
      return undefined  // Exclude from export
    }

    // Handle Infinity values
    if (value === Infinity) return "Infinity"
    if (value === -Infinity) return "-Infinity"

    return value
  }, 2)

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedState)
        setSuccess("Copied to clipboard!")
        setTimeout(() => setSuccess(null), 2000)
      } else {
        // Fallback to older method
        const textArea = document.createElement("textarea")
        textArea.value = formattedState
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          const successful = document.execCommand('copy')
          document.body.removeChild(textArea)

          if (successful) {
            setSuccess("Copied to clipboard!")
            setTimeout(() => setSuccess(null), 2000)
          } else {
            throw new Error("Copy command failed")
          }
        } catch (err) {
          document.body.removeChild(textArea)
          throw err
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to copy: ${errorMessage}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  const validateDomains = (domains: any[]): boolean => {
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i]

      if (!domain.id || typeof domain.id !== "string") {
        setError(`Invalid domain at index ${i}: missing or invalid 'id'`)
        return false
      }

      if (!domain.name || typeof domain.name !== "string") {
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

        if (!dim.id || typeof dim.id !== "string") {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: missing or invalid 'id'`)
          return false
        }

        if (!dim.name || typeof dim.name !== "string") {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: missing or invalid 'name'`)
          return false
        }

        if (!Array.isArray(dim.range) || dim.range.length !== 2) {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: 'range' must be an array of 2 values`)
          return false
        }

        // Accept numbers or "Infinity"/"-Infinity" strings
        const isValidRangeValue = (val: any) =>
          typeof val === "number" || val === "Infinity" || val === "-Infinity"

        if (!isValidRangeValue(dim.range[0]) || !isValidRangeValue(dim.range[1])) {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: 'range' values must be numbers or "Infinity"`)
          return false
        }

        // Convert to numbers for comparison
        const min = dim.range[0] === "Infinity" ? Infinity : dim.range[0] === "-Infinity" ? -Infinity : dim.range[0]
        const max = dim.range[1] === "Infinity" ? Infinity : dim.range[1] === "-Infinity" ? -Infinity : dim.range[1]

        if (min >= max) {
          setError(`Invalid dimension at domain ${i}, dimension ${j}: range[0] must be less than range[1]`)
          return false
        }
      }
    }

    return true
  }

  const convertInfinity = (val: any) => {
    if (val === "Infinity") return Infinity
    if (val === "-Infinity") return -Infinity
    return val
  }

  const parseDomains = (rawDomains: any[]) =>
    rawDomains.map((domain: any) => ({
      ...domain,
      createdAt: new Date(domain.createdAt),
      dimensions: domain.dimensions.map((dim: any) => ({
        ...dim,
        range: [convertInfinity(dim.range[0]), convertInfinity(dim.range[1])] as const,
      })),
      labels: (domain.labels || []).map((label: any) => ({
        ...label,
        createdAt: new Date(label.createdAt),
        dimensions: label.dimensions.map((d: any) => {
          if ('range' in d) {
            return {
              ...d,
              range: [convertInfinity(d.range[0]), convertInfinity(d.range[1])] as const,
            }
          }
          return d
        }),
      })),
    }))

  const parseConcepts = (rawConcepts: any[]) =>
    (rawConcepts || []).map((concept: any) => ({
      ...concept,
      createdAt: new Date(concept.createdAt),
    }))

  const parseInstances = (rawInstances: any[]) =>
    (rawInstances || []).map((instance: any) => ({
      ...instance,
      createdAt: new Date(instance.createdAt),
    }))

  const parseWords = (rawWords: any[]) =>
    (rawWords || []).map((word: any) => ({
      ...word,
      createdAt: new Date(word.createdAt),
    }))

  const handleImport = () => {
    setError(null)
    setSuccess(null)

    try {
      const parsed = JSON.parse(jsonInput)

      if (!parsed || typeof parsed !== "object") {
        setError("Invalid JSON: must be an object")
        return
      }

      // Detect export type
      const isLibraryOnly = parsed.exportType === 'library'

      if (isLibraryOnly) {
        // Library-only import — preserve existing library domains
        const words = parseWords(parsed.words || [])
        dispatch({ type: 'RESTORE_LIBRARY_STATE', payload: { words, domains: state.library.domains } })
        setSuccess(`Library state imported! (${words.length} word${words.length !== 1 ? 's' : ''})`)
        setJsonInput("")
        setTimeout(() => setSuccess(null), 2000)
        return
      }

      // Scene import (includes library)
      let rawDomains: any[]
      let rawConcepts: any[]
      let rawInstances: any[]
      let rawWords: any[]

      if (parsed.scene) {
        // Old nested format
        rawDomains = parsed.scene.domains || []
        rawConcepts = parsed.scene.concepts || []
        rawInstances = parsed.scene.instances || []
        rawWords = parsed.library?.words || []
      } else {
        // Flat format (new or legacy)
        rawDomains = parsed.domains || []
        rawConcepts = parsed.concepts || []
        rawInstances = parsed.instances || []
        rawWords = parsed.words || []
      }

      if (!Array.isArray(rawDomains)) {
        setError("Invalid state: missing 'domains' array")
        return
      }

      if (!validateDomains(rawDomains)) return

      const domains = parseDomains(rawDomains)
      const concepts = parseConcepts(rawConcepts)
      const instances = parseInstances(rawInstances)
      const words = parseWords(rawWords)

      dispatch({
        type: 'RESTORE_SCENE_STATE',
        payload: { domains, concepts, instances },
      })
      dispatch({
        type: 'RESTORE_LIBRARY_STATE',
        payload: { words, domains },
      })

      setSuccess("State imported successfully!")
      setJsonInput("")
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError(`Invalid JSON syntax: ${err.message}`)
      } else {
        setError(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value)
    setError(null)
  }

  return (
    <div className="absolute top-4 right-4 z-30">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        {isOpen ? <CloseIcon fontSize="small" /> : <CodeIcon fontSize="small" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed sm:absolute top-16 sm:top-12 left-2 right-2 sm:left-auto sm:right-0 bg-white rounded-lg shadow-xl p-3 sm:p-4 sm:w-[600px] lg:w-[800px] max-w-[calc(100vw-1rem)] sm:max-w-[95vw] max-h-[calc(100vh-5rem)] sm:max-h-[80vh] overflow-hidden flex flex-col">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Data Structure Code</h2>

          {/* Success Message */}
          {success && (
            <div className="mb-3 bg-green-50 border border-green-200 text-green-800 p-2 rounded text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-800 p-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Summary Section */}
          <div className="mb-4 p-2 sm:p-3 bg-gray-50 rounded border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-gray-700">Domains:</span>{" "}
                <span className="text-gray-900">{state.scene.domains.length}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Labels:</span>{" "}
                <span className="text-gray-900">
                  {state.scene.domains.reduce((total, d) => total + d.labels.length, 0)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-purple-700">Concepts:</span>{" "}
                <span className="text-purple-900">{state.scene.concepts.length}</span>
              </div>
              <div>
                <span className="font-semibold text-blue-700">Words:</span>{" "}
                <span className="text-blue-900">{state.library.words.length}</span>
              </div>
            </div>
            {state.scene.concepts.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-700 font-semibold mb-1">Concepts:</div>
                <div className="flex flex-wrap gap-2">
                  {state.scene.concepts.map((concept) => (
                    <div
                      key={concept.id}
                      className="px-2 py-1 bg-purple-100 text-purple-900 rounded text-xs"
                    >
                      {concept.name} ({concept.labelRefs.length} labels)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 overflow-hidden flex-1">
            {/* Left Column: Current State */}
            <div className="flex-1 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Current State</h3>
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-50 p-2 sm:p-3 rounded font-mono text-[10px] sm:text-xs overflow-auto flex-1 border border-gray-200 select-text cursor-text">
                {formattedState}
              </pre>
            </div>

            {/* Right Column: Import */}
            <div className="flex-1 flex flex-col min-h-[200px]">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Import State</h3>
              <textarea
                value={jsonInput}
                onChange={handleTextareaChange}
                placeholder="Paste JSON here (library-only or full scene export)..."
                className="border border-gray-300 rounded p-2 sm:p-3 font-mono text-[10px] sm:text-xs flex-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleImport}
                disabled={!jsonInput.trim()}
                className="mt-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
