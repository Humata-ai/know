'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type {
  QualityDomain,
  QualityDomainLabel,
  QualityDomainPoint,
  Concept,
  ConceptInstance,
} from '../shared/types'
import { isPoint } from '../shared/types'

/**
 * ConceptualSpaceContext
 *
 * Provides the "current conceptual space" data to all visualization children.
 *
 * This decouples child components (like ConceptVisualization3D) from the
 * global app store, allowing the same components to render correctly whether
 * the data comes from the scene store or from a library word's conceptual
 * structure.
 *
 * Previously, ConceptVisualization3D reached into the global store via
 * useQualityDomain() to look up domains, labels, instances, and compute
 * circular layout positions. This worked for the scene tab (where the store
 * IS the data source) but broke in the library tab (where the data comes
 * from a selected word's conceptual structure -- different domain IDs,
 * different domain count, etc.).
 */

export interface ConceptualSpaceData {
  /** The domains being visualized */
  domains: QualityDomain[]
  /** The concepts being visualized */
  concepts: Concept[]
  /** The instances being visualized */
  instances: ConceptInstance[]
  /** Currently selected domain ID, or null */
  selectedDomainId: string | null
  /** Currently selected concept ID, or null */
  selectedConceptId: string | null
  /** Currently selected instance ID, or null */
  selectedInstanceId: string | null
  /** The scale at which domains are rendered in the circular layout */
  domainScale: number
}

export interface ConceptualSpaceContextType extends ConceptualSpaceData {
  /** Get all labels for a given concept (resolved from labelRefs) */
  getConceptLabels: (conceptId: string) => QualityDomainLabel[]
  /** Get all instances for a given concept */
  getConceptInstances: (conceptId: string) => ConceptInstance[]
  /** Get all points for a given instance (resolved from pointRefs) */
  getInstancePoints: (instanceId: string) => QualityDomainPoint[]
}

const ConceptualSpaceContext = createContext<ConceptualSpaceContextType | null>(null)

/**
 * Hook to access the current conceptual space data.
 *
 * Must be used within a ConceptualSpaceProvider (which is set up by
 * ConceptualSpaceVisualizer).
 */
export function useConceptualSpace(): ConceptualSpaceContextType {
  const ctx = useContext(ConceptualSpaceContext)
  if (!ctx) {
    throw new Error(
      'useConceptualSpace must be used within a ConceptualSpaceProvider. ' +
      'Wrap your component tree with ConceptualSpaceVisualizer or ConceptualSpaceProvider.'
    )
  }
  return ctx
}

interface ConceptualSpaceProviderProps extends ConceptualSpaceData {
  children: ReactNode
}

/**
 * Provider component that makes conceptual space data available to all
 * visualization children via React context.
 *
 * The selector functions (getConceptLabels, etc.) operate on the provided
 * data rather than the global store, ensuring correct behavior regardless
 * of whether the data comes from scene state or a library word.
 */
export function ConceptualSpaceProvider({
  domains,
  concepts,
  instances,
  selectedDomainId,
  selectedConceptId,
  selectedInstanceId,
  domainScale,
  children,
}: ConceptualSpaceProviderProps) {
  const value = useMemo<ConceptualSpaceContextType>(() => {
    const getConceptLabels = (conceptId: string): QualityDomainLabel[] => {
      const concept = concepts.find((c) => c.id === conceptId)
      if (!concept) return []

      const labels: QualityDomainLabel[] = []
      for (const ref of concept.labelRefs) {
        const domain = domains.find((d) => d.id === ref.domainId)
        if (domain) {
          const label = domain.labels.find((l) => l.id === ref.labelId)
          if (label) {
            labels.push(label)
          }
        }
      }
      return labels
    }

    const getConceptInstances = (conceptId: string): ConceptInstance[] => {
      return instances.filter((i) => i.conceptId === conceptId)
    }

    const getInstancePoints = (instanceId: string): QualityDomainPoint[] => {
      const instance = instances.find((i) => i.id === instanceId)
      if (!instance) return []

      return instance.pointRefs
        .map((ref) => {
          const domain = domains.find((d) => d.id === ref.domainId)
          if (!domain) return null
          const label = domain.labels.find((l) => l.id === ref.pointId)
          return label && isPoint(label) ? label : null
        })
        .filter((p): p is QualityDomainPoint => p !== null)
    }

    return {
      domains,
      concepts,
      instances,
      selectedDomainId,
      selectedConceptId,
      selectedInstanceId,
      domainScale,
      getConceptLabels,
      getConceptInstances,
      getInstancePoints,
    }
  }, [domains, concepts, instances, selectedDomainId, selectedConceptId, selectedInstanceId, domainScale])

  return (
    <ConceptualSpaceContext.Provider value={value}>
      {children}
    </ConceptualSpaceContext.Provider>
  )
}
