import { useMemo, memo } from 'react'
import { Text } from '@react-three/drei'
import DomainVisualization from '../quality-domain/DomainVisualization'
import ConceptVisualization3D from '../concept/ConceptVisualization3D'
import type { QualityDomain, Concept, ConceptInstance } from '../shared/types'
import { useCircularLayout } from '@/app/hooks/useCircularLayout'
import { DOMAIN_SCALE } from '../quality-domain/visualizations/constants'
import { ConceptualSpaceProvider } from './ConceptualSpaceContext'
import { areDimensionsEqual, areLabelsEqual } from '@/app/utils/equality'

/**
 * Props for the ConceptualSpaceVisualizer.
 * 
 * This component renders a conceptual space: a set of quality domains
 * arranged in a circular layout with concepts overlaid on top.
 * It is decoupled from the store -- the caller decides what data to visualize.
 */
export interface ConceptualSpaceVisualizerProps {
  domains: QualityDomain[]
  concepts: Concept[]
  instances: ConceptInstance[]
  selectedDomainId: string | null
  selectedConceptId: string | null
  selectedInstanceId: string | null
  /** Text shown when there are no domains to visualize */
  emptyMessage?: string
}

// Custom comparison for domain items - only re-render if domain data actually changed
const domainItemAreEqual = (
  prevProps: { domain: QualityDomain; position: readonly [number, number, number]; scale: number },
  nextProps: { domain: QualityDomain; position: readonly [number, number, number]; scale: number }
) => {
  return (
    prevProps.domain.id === nextProps.domain.id &&
    prevProps.domain.name === nextProps.domain.name &&
    prevProps.position === nextProps.position &&
    prevProps.scale === nextProps.scale &&
    areDimensionsEqual(prevProps.domain.dimensions, nextProps.domain.dimensions) &&
    areLabelsEqual(prevProps.domain.labels, nextProps.domain.labels)
  )
}

// Memoized individual domain component
const DomainItem = memo(({
  domain,
  position,
  scale
}: {
  domain: QualityDomain
  position: readonly [number, number, number]
  scale: number
}) => {
  const labelPosition = useMemo(() => [0, -12, 0] as const, [])

  return (
    <group position={position} scale={scale}>
      <DomainVisualization domain={domain} />
      <Text position={labelPosition} fontSize={2} color="black">
        {domain.name}
      </Text>
    </group>
  )
}, domainItemAreEqual)
DomainItem.displayName = 'DomainItem'

const SelectedDomainItem = memo(({
  domain,
  position,
  scale
}: {
  domain: QualityDomain
  position: readonly [number, number, number]
  scale: number
}) => {
  const labelPosition = useMemo(() => [0, -12, 0] as const, [])

  return (
    <group position={position} scale={scale}>
      <DomainVisualization domain={domain} />
      <Text position={labelPosition} fontSize={2} color="orange">
        {domain.name}
      </Text>
    </group>
  )
}, domainItemAreEqual)
SelectedDomainItem.displayName = 'SelectedDomainItem'

function ConceptualSpaceVisualizer({
  domains,
  concepts,
  instances,
  selectedDomainId,
  selectedConceptId,
  selectedInstanceId,
  emptyMessage = 'No domains yet. Click "+ Add Domain" to create one.',
}: ConceptualSpaceVisualizerProps) {
  // Calculate positions using shared hook
  const domainPositions = useCircularLayout(domains.length)

  const emptyPosition = useMemo(() => [0, 0, 0] as const, [])

  const domainScale = DOMAIN_SCALE.ALL_DOMAINS_VIEW

  // Handle empty state
  if (domains.length === 0) {
    return (
      <Text position={emptyPosition} fontSize={1.5} color="gray">
        {emptyMessage}
      </Text>
    )
  }

  return (
    <ConceptualSpaceProvider
      domains={domains}
      concepts={concepts}
      instances={instances}
      selectedDomainId={selectedDomainId}
      selectedConceptId={selectedConceptId}
      selectedInstanceId={selectedInstanceId}
      domainScale={domainScale}
    >
      <group>
        {/* Render each domain at its position */}
        {domains.map((domain, index) => {
          // Skip 4D+ domains as they're handled by TableView
          if (domain.dimensions.length >= 4) {
            return null
          }

          const position = domainPositions[index]
          const isSelected = selectedDomainId === domain.id
          const scale = domainScale

          const Component = isSelected ? SelectedDomainItem : DomainItem

          return (
            <Component
              key={domain.id}
              domain={domain}
              position={position}
              scale={scale}
            />
          )
        })}

        {/* Render all concepts */}
        {concepts.map((concept) => (
          <ConceptVisualization3D
            key={concept.id}
            concept={concept}
            isSelected={selectedConceptId === concept.id}
          />
        ))}
      </group>
    </ConceptualSpaceProvider>
  )
}

// Memoize the entire component to prevent re-renders when camera moves
export default memo(ConceptualSpaceVisualizer)
