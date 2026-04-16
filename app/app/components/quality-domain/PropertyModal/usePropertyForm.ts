'use client'

import { useState, useEffect } from 'react'
import { useQualityDomain } from '@/app/store'
import type { Property, PropertyDimensionRange, PointDimensionValue, QualityDomain } from '../../shared/types'
import { generateId } from '../../shared/utils'

interface UsePropertyFormProps {
  isOpen: boolean
  domainId: string | null
  editingPropertyId: string | null
  /** When true, operates on library state instead of scene state */
  useLibraryState?: boolean
}

export default function usePropertyForm({ isOpen, domainId, editingPropertyId, useLibraryState = false }: UsePropertyFormProps) {
  const { state, addProperty, updateProperty, addLibraryProperty, updateLibraryProperty } = useQualityDomain()
  const [name, setName] = useState('')
  const [propertyType, setPropertyType] = useState<'region' | 'point' | null>(null)
  const [regionDimensions, setRegionDimensions] = useState<PropertyDimensionRange[]>([])
  const [pointDimensions, setPointDimensions] = useState<PointDimensionValue[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const domains = useLibraryState ? state.library.domains : state.scene.domains
  const domain = domainId ? domains.find((d) => d.id === domainId) : null
  const editingProperty = editingPropertyId && domain
    ? domain.properties.find((l) => l.id === editingPropertyId)
    : null

  useEffect(() => {
    if (isOpen && domain) {
      if (editingProperty) {
        setName(editingProperty.name || '')
        setPropertyType(editingProperty.type)

        if (editingProperty.type === 'region') {
          setRegionDimensions(editingProperty.dimensions)
          setPointDimensions([])
        } else {
          setPointDimensions(editingProperty.dimensions)
          setRegionDimensions([])
        }
      } else {
        setName('')
        setPropertyType(null)
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
  }, [isOpen, domain, editingProperty])

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

    if (!propertyType) {
      newErrors.push('Please select a property type')
    }

    if (!domain) {
      newErrors.push('Invalid domain')
      setErrors(newErrors)
      return false
    }

    if (propertyType === 'region') {
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
    } else if (propertyType === 'point') {
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
    if (!propertyType || !domain) return

    setIsGenerating(true)
    setErrors([])

    try {
      const response = await fetch('/api/generate-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyName: name,
          propertyType,
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

      if (propertyType === 'region' && data.type === 'region') {
        setRegionDimensions(data.dimensions)
      } else if (propertyType === 'point' && data.type === 'point') {
        setPointDimensions(data.dimensions)
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to generate property dimensions'])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (onClose: () => void) => (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !domain || !propertyType) {
      return
    }

    const property: Property = propertyType === 'region'
      ? {
          type: 'region',
          id: editingProperty?.id || generateId(),
          name: name.trim() || undefined,
          domainId: domain.id,
          dimensions: regionDimensions,
          createdAt: editingProperty?.createdAt || new Date(),
        }
      : {
          type: 'point',
          id: editingProperty?.id || generateId(),
          name: name.trim() || undefined,
          domainId: domain.id,
          dimensions: pointDimensions,
          createdAt: editingProperty?.createdAt || new Date(),
        }

    if (useLibraryState) {
      if (editingProperty) {
        updateLibraryProperty(domain.id, property)
      } else {
        addLibraryProperty(domain.id, property)
      }
    } else {
      if (editingProperty) {
        updateProperty(domain.id, property)
      } else {
        addProperty(domain.id, property)
      }
    }

    onClose()
  }

  return {
    name,
    setName,
    propertyType,
    setPropertyType,
    regionDimensions,
    pointDimensions,
    errors,
    isGenerating,
    domain,
    editingProperty,
    handleRegionRangeChange,
    handlePointValueChange,
    handleGenerate,
    handleSubmit,
  }
}
