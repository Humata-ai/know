'use client'

import { useState, useEffect } from 'react'
import { useQualityDomain } from '@/app/store'
import type { QualityDomainLabel, RegionDimensionRange, PointDimensionValue, QualityDomain } from '../../shared/types'
import { generateId } from '../../shared/utils'

interface UseLabelFormProps {
  isOpen: boolean
  domainId: string | null
  editingLabelId: string | null
  /** When true, operates on library state instead of scene state */
  useLibraryState?: boolean
}

export default function useLabelForm({ isOpen, domainId, editingLabelId, useLibraryState = false }: UseLabelFormProps) {
  const { state, addLabel, updateLabel, addLibraryLabel, updateLibraryLabel } = useQualityDomain()
  const [name, setName] = useState('')
  const [labelType, setLabelType] = useState<'region' | 'point' | null>(null)
  const [regionDimensions, setRegionDimensions] = useState<RegionDimensionRange[]>([])
  const [pointDimensions, setPointDimensions] = useState<PointDimensionValue[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const domains = useLibraryState ? state.library.domains : state.scene.domains
  const domain = domainId ? domains.find((d) => d.id === domainId) : null
  const editingLabel = editingLabelId && domain
    ? domain.labels.find((l) => l.id === editingLabelId)
    : null

  useEffect(() => {
    if (isOpen && domain) {
      if (editingLabel) {
        setName(editingLabel.name)
        setLabelType(editingLabel.type)

        if (editingLabel.type === 'region') {
          setRegionDimensions(editingLabel.dimensions)
          setPointDimensions([])
        } else {
          setPointDimensions(editingLabel.dimensions)
          setRegionDimensions([])
        }
      } else {
        setName('')
        setLabelType(null)
        setRegionDimensions(
          domain.dimensions.map((dim) => ({
            dimensionId: dim.id,
            range: [
              dim.range[0] === -Infinity ? 0 : dim.range[0],
              dim.range[1] === Infinity ? 1 : dim.range[1],
            ] as const,
          }))
        )
        setPointDimensions(
          domain.dimensions.map((dim) => ({
            dimensionId: dim.id,
            value: (dim.range[0] + dim.range[1]) / 2,
          }))
        )
      }
      setErrors([])
    }
  }, [isOpen, domain, editingLabel])

  const handleRegionRangeChange = (
    dimensionId: string,
    field: 'min' | 'max',
    value: number
  ) => {
    setRegionDimensions((ranges) =>
      ranges.map((r) => {
        if (r.dimensionId === dimensionId) {
          const newRange: readonly [number, number] =
            field === 'min' ? [value, r.range[1]] : [r.range[0], value]
          return { ...r, range: newRange }
        }
        return r
      })
    )
  }

  const handlePointValueChange = (dimensionId: string, value: number) => {
    setPointDimensions((points) =>
      points.map((p) =>
        p.dimensionId === dimensionId ? { ...p, value } : p
      )
    )
  }

  const validate = (): boolean => {
    const newErrors: string[] = []

    if (!name.trim()) {
      newErrors.push('Label name is required')
    }

    if (!labelType) {
      newErrors.push('Please select a label type')
    }

    if (!domain) {
      newErrors.push('Invalid domain')
      setErrors(newErrors)
      return false
    }

    if (labelType === 'region') {
      regionDimensions.forEach((dr) => {
        const dimension = domain.dimensions.find((d) => d.id === dr.dimensionId)
        if (!dimension) return

        if (dr.range[0] >= dr.range[1]) {
          newErrors.push(`${dimension.name}: Min must be less than Max`)
        }

        if (dr.range[0] < dimension.range[0] || dr.range[1] > dimension.range[1]) {
          newErrors.push(
            `${dimension.name}: Range must be within domain range [${dimension.range[0]}, ${dimension.range[1]}]`
          )
        }
      })
    } else if (labelType === 'point') {
      pointDimensions.forEach((pd) => {
        const dimension = domain.dimensions.find((d) => d.id === pd.dimensionId)
        if (!dimension) return

        if (pd.value < dimension.range[0] || pd.value > dimension.range[1]) {
          newErrors.push(
            `${dimension.name}: Value must be within domain range [${dimension.range[0]}, ${dimension.range[1]}]`
          )
        }
      })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleGenerate = async () => {
    if (!name.trim()) {
      setErrors(['Please enter a label name before generating'])
      return
    }
    if (!labelType || !domain) return

    setIsGenerating(true)
    setErrors([])

    try {
      const response = await fetch('/api/generate-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labelName: name,
          labelType,
          domainName: domain.name,
          dimensions: domain.dimensions.map((d) => ({
            id: d.id,
            name: d.name,
            range: [d.range[0], d.range[1]],
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate')
      }

      const data = await response.json()

      if (labelType === 'region' && data.type === 'region') {
        setRegionDimensions(data.dimensions)
      } else if (labelType === 'point' && data.type === 'point') {
        setPointDimensions(data.dimensions)
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to generate label dimensions'])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (onClose: () => void) => (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !domain || !labelType) {
      return
    }

    const label: QualityDomainLabel = labelType === 'region'
      ? {
          type: 'region',
          id: editingLabel?.id || generateId(),
          name,
          domainId: domain.id,
          dimensions: regionDimensions,
          createdAt: editingLabel?.createdAt || new Date(),
        }
      : {
          type: 'point',
          id: editingLabel?.id || generateId(),
          name,
          domainId: domain.id,
          dimensions: pointDimensions,
          createdAt: editingLabel?.createdAt || new Date(),
        }

    if (useLibraryState) {
      if (editingLabel) {
        updateLibraryLabel(domain.id, label)
      } else {
        addLibraryLabel(domain.id, label)
      }
    } else {
      if (editingLabel) {
        updateLabel(domain.id, label)
      } else {
        addLabel(domain.id, label)
      }
    }

    onClose()
  }

  return {
    name,
    setName,
    labelType,
    setLabelType,
    regionDimensions,
    pointDimensions,
    errors,
    isGenerating,
    domain,
    editingLabel,
    handleRegionRangeChange,
    handlePointValueChange,
    handleGenerate,
    handleSubmit,
  }
}
