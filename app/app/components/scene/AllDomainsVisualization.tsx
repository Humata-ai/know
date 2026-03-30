import { memo } from 'react'
import { useQualityDomain } from '@/app/store'
import ConceptualSpaceVisualizer from './ConceptualSpaceVisualizer'

/**
 * AllDomainsVisualization
 * 
 * A store-connected wrapper around ConceptualSpaceVisualizer.
 * Reads scene state from the store and passes it as props.
 * 
 * @deprecated Prefer using ConceptualSpaceVisualizer directly with explicit props
 *   for better decoupling from the store.
 */
function AllDomainsVisualization() {
  const { state } = useQualityDomain()

  return (
    <ConceptualSpaceVisualizer
      domains={state.scene.domains}
      concepts={state.scene.concepts}
      instances={state.scene.instances}
      selectedDomainId={state.scene.selectedDomainId}
      selectedConceptId={state.scene.selectedConceptId}
      selectedInstanceId={state.scene.selectedInstanceId}
    />
  )
}

// Memoize the entire component to prevent re-renders when camera moves
export default memo(AllDomainsVisualization)
