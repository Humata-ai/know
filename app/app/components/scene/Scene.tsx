'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ConceptualSpaceVisualizer from './ConceptualSpaceVisualizer'
import { useQualityDomain } from '@/app/store'
import type { QualityDomain, Concept, ConceptInstance } from '../shared/types'
import { calculateLabelPosition, calculateCentroid, calculateConceptLabelPositions } from '@/app/utils/labelPositionCalculations'
import { Vector3 } from 'three'
import type { SidebarView } from './sidebar/types'

/**
 * Determines which visualization mode the 3D viewer should be in
 * based on the active tab.
 */
type VisualizationMode = 'inspect' | 'library'

function getVisualizationMode(activeTab: SidebarView | null): VisualizationMode {
  if (activeTab === 'library') return 'library'
  return 'inspect'
}

/**
 * Camera controls for the inspect visualization mode.
 * Animates camera target based on selection state.
 */
function InspectCameraControls() {
  const { state, getConceptLabels, getInstancePoints } = useQualityDomain()
  const controlsRef = useRef<any>(null)
  const animatingRef = useRef(false)
  const startTargetRef = useRef(new Vector3(0, 0, 0))
  const endTargetRef = useRef(new Vector3(0, 0, 0))
  const startTimeRef = useRef(0)

  // Calculate position of selected item
  const targetPosition = useMemo(() => {
    // Calculate domain positions (same as ConceptualSpaceVisualizer)
    const radius = 15
    const total = state.scene.domains.length
    const angleStep = (2 * Math.PI) / total

    const domainPositions = new Map<string, readonly [number, number, number]>()
    state.scene.domains.forEach((domain, index) => {
      const angle = index * angleStep
      const x = radius * Math.cos(angle)
      const z = radius * Math.sin(angle) - 15
      domainPositions.set(domain.id, [x, 0, z] as const)
    })

    // If domain is selected
    if (state.scene.selectedDomainId) {
      const pos = domainPositions.get(state.scene.selectedDomainId)
      if (pos) return new Vector3(pos[0], pos[1], pos[2])
    }

    // If label is selected
    if (state.scene.selectedLabelId && state.scene.selectedLabelDomainId) {
      const domain = state.scene.domains.find(d => d.id === state.scene.selectedLabelDomainId)
      const label = domain?.labels.find(p => p.id === state.scene.selectedLabelId)
      const domainPos = domainPositions.get(state.scene.selectedLabelDomainId)

      if (domain && label && domainPos) {
        const scale = 0.5
        const position = calculateLabelPosition(label, domain, domainPos, scale)
        if (position) {
          return position
        }
      }
    }

    // If instance is selected
    if (state.scene.selectedInstanceId) {
      const instance = state.scene.instances.find(i => i.id === state.scene.selectedInstanceId)
      if (instance) {
        const points = getInstancePoints(instance.id)
        const positions: Vector3[] = []

        // Helper to get point value
        const getPointValue = (
          pointDim: typeof points[0]['dimensions'][0] | undefined
        ): number | undefined => {
          if (!pointDim || !('value' in pointDim)) return undefined
          return pointDim.value
        }

        points.forEach(point => {
          const domain = state.scene.domains.find(d => d.id === point.domainId)
          if (!domain || domain.dimensions.length >= 4) return

          const domainPos = domainPositions.get(domain.id)
          if (!domainPos) return

          const scale = 0.5

          let worldPosition: Vector3

          if (domain.dimensions.length === 1) {
            // 1D points
            const dim = domain.dimensions[0]
            const pointDim = point.dimensions.find(d => d.dimensionId === dim.id)
            const value = getPointValue(pointDim)
            if (value === undefined) return

            const [dimMin, dimMax] = dim.range
            const pos = -5 + ((value - dimMin) / (dimMax - dimMin)) * 10

            worldPosition = new Vector3(
              domainPos[0] + pos * scale,
              domainPos[1] + 0.3 * scale,
              domainPos[2]
            )
          } else if (domain.dimensions.length === 2) {
            // 2D points
            const dimX = domain.dimensions[0]
            const dimY = domain.dimensions[1]

            const pointDimX = point.dimensions.find(d => d.dimensionId === dimX.id)
            const pointDimY = point.dimensions.find(d => d.dimensionId === dimY.id)

            const valueX = getPointValue(pointDimX)
            const valueY = getPointValue(pointDimY)
            if (valueX === undefined || valueY === undefined) return

            const [dimMinX, dimMaxX] = dimX.range
            const [dimMinY, dimMaxY] = dimY.range

            const posX = -5 + ((valueX - dimMinX) / (dimMaxX - dimMinX)) * 10
            const posY = -5 + ((valueY - dimMinY) / (dimMaxY - dimMinY)) * 10

            worldPosition = new Vector3(
              domainPos[0] + posX * scale,
              domainPos[1] + posY * scale,
              domainPos[2]
            )
          } else {
            // 3D points
            const values = domain.dimensions.map(dim => {
              const pointDim = point.dimensions.find(d => d.dimensionId === dim.id)
              const value = getPointValue(pointDim)
              if (value === undefined) return null

              const [dimMin, dimMax] = dim.range
              return -4 + ((value - dimMin) / (dimMax - dimMin)) * 8
            })

            if (values.some(v => v === null)) return

            worldPosition = new Vector3(
              domainPos[0] + values[0]! * scale,
              domainPos[1] + values[1]! * scale,
              domainPos[2] + values[2]! * scale
            )
          }

          positions.push(worldPosition)
        })

        // Calculate centroid of instance points
        if (positions.length > 0) {
          const centroid = new Vector3(0, 0, 0)
          positions.forEach(pos => centroid.add(pos))
          centroid.divideScalar(positions.length)
          return centroid
        }
      }
    }

    // If concept is selected
    if (state.scene.selectedConceptId) {
      const concept = state.scene.concepts.find(c => c.id === state.scene.selectedConceptId)
      if (concept) {
        const labels = getConceptLabels(concept.id)
        const scale = 0.5

        // Calculate positions for all labels and find centroid
        const positions = calculateConceptLabelPositions(
          labels,
          state.scene.domains,
          domainPositions,
          scale
        )

        const centroid = calculateCentroid(positions)
        if (centroid) {
          centroid.y += 8 // Concept label is 8 units above centroid
          return centroid
        }
      }
    }

    // Default position
    return new Vector3(0, 0, 0)
  }, [state.scene.selectedDomainId, state.scene.selectedLabelId, state.scene.selectedLabelDomainId, state.scene.selectedInstanceId, state.scene.selectedConceptId, state.scene.domains, state.scene.concepts, state.scene.instances, getConceptLabels, getInstancePoints])

  // Update controls target when selection changes with smooth animation
  useEffect(() => {
    if (!controlsRef.current) return

    // Start animation
    startTargetRef.current.copy(controlsRef.current.target)
    endTargetRef.current.copy(targetPosition)
    startTimeRef.current = performance.now()
    animatingRef.current = true

    const animate = () => {
      if (!animatingRef.current || !controlsRef.current) return

      const elapsed = performance.now() - startTimeRef.current
      const duration = 300 // 300ms animation
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      // Interpolate between start and end positions
      controlsRef.current.target.lerpVectors(
        startTargetRef.current,
        endTargetRef.current,
        easeProgress
      )
      controlsRef.current.update()

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        animatingRef.current = false
      }
    }

    requestAnimationFrame(animate)

    return () => {
      animatingRef.current = false
    }
  }, [targetPosition])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={false}
      enableZoom
      zoomToCursor
      enablePan
      makeDefault
    />
  )
}

/**
 * Camera controls for the library visualization mode.
 * Centers on the origin (placeholder until library has spatial data).
 */
function LibraryCameraControls() {
  const { state, getConceptLabels } = useQualityDomain()
  const controlsRef = useRef<any>(null)
  const animatingRef = useRef(false)
  const startTargetRef = useRef(new Vector3(0, 0, 0))
  const endTargetRef = useRef(new Vector3(0, 0, 0))
  const startTimeRef = useRef(0)

  // Calculate position of selected library item
  const targetPosition = useMemo(() => {
    const { selectedItemId, selectedItemType } = state.library

    if (!selectedItemId || !selectedItemType) {
      return new Vector3(0, 0, 0)
    }

    // For quality domains, focus on center (they're rendered at origin in library mode)
    if (selectedItemType === 'quality-domain') {
      return new Vector3(0, 0, 0)
    }

    // For concepts, focus on the centroid of the concept's labels
    if (selectedItemType === 'concept') {
      const concept = state.library.concepts.find(c => c.id === selectedItemId)
      if (concept) {
        const labels = getConceptLabels(concept.id)
        
        // Calculate domain positions (same as ConceptualSpaceVisualizer)
        const radius = 15
        const domains = state.library.domains.filter(d => 
          concept.labelRefs.some(ref => ref.domainId === d.id)
        )
        const total = domains.length
        const angleStep = (2 * Math.PI) / total

        const domainPositions = new Map<string, readonly [number, number, number]>()
        domains.forEach((domain, index) => {
          const angle = index * angleStep
          const x = radius * Math.cos(angle)
          const z = radius * Math.sin(angle) - 15
          domainPositions.set(domain.id, [x, 0, z] as const)
        })

        const scale = 0.5

        // Calculate positions for all labels and find centroid
        const positions = calculateConceptLabelPositions(
          labels,
          domains,
          domainPositions,
          scale
        )

        const centroid = calculateCentroid(positions)
        if (centroid) {
          centroid.y += 8 // Concept label is 8 units above centroid
          return centroid
        }
      }
    }

    return new Vector3(0, 0, 0)
  }, [state.library.selectedItemId, state.library.selectedItemType, state.library.concepts, state.library.domains, getConceptLabels])

  // Update controls target when selection changes with smooth animation
  useEffect(() => {
    if (!controlsRef.current) return

    // Start animation
    startTargetRef.current.copy(controlsRef.current.target)
    endTargetRef.current.copy(targetPosition)
    startTimeRef.current = performance.now()
    animatingRef.current = true

    const animate = () => {
      if (!animatingRef.current || !controlsRef.current) return

      const elapsed = performance.now() - startTimeRef.current
      const duration = 300 // 300ms animation
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      // Interpolate between start and end positions
      controlsRef.current.target.lerpVectors(
        startTargetRef.current,
        endTargetRef.current,
        easeProgress
      )
      controlsRef.current.update()

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        animatingRef.current = false
      }
    }

    requestAnimationFrame(animate)

    return () => {
      animatingRef.current = false
    }
  }, [targetPosition])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={false}
      enableZoom
      zoomToCursor
      enablePan
      makeDefault
    />
  )
}

/** Empty conceptual space data for tabs that don't have data yet */
const EMPTY_CONCEPTUAL_SPACE = {
  domains: [] as QualityDomain[],
  concepts: [] as Concept[],
  instances: [] as ConceptInstance[],
  selectedDomainId: null,
  selectedConceptId: null,
  selectedInstanceId: null,
}

interface SceneProps {
  activeTab?: SidebarView | null
}

export default function Scene({ activeTab = null }: SceneProps) {
  const { state } = useQualityDomain()

  const mode = getVisualizationMode(activeTab)

  // Select the conceptual space data based on the active tab.
  // Inspect tab: uses scene state from the store.
  // Library tab: only renders the specifically selected item's conceptual structure.
  const visualizationData = useMemo(() => {
    if (mode === 'library') {
      const { selectedItemId, selectedItemType } = state.library

      // Nothing selected — show empty space with prompt
      if (!selectedItemId || !selectedItemType) {
        return EMPTY_CONCEPTUAL_SPACE
      }

      // A quality domain is selected — show just that domain
      if (selectedItemType === 'quality-domain') {
        const domain = state.library.domains.find(d => d.id === selectedItemId)
        if (!domain) return EMPTY_CONCEPTUAL_SPACE
        return {
          domains: [domain],
          concepts: [],
          instances: [],
          selectedDomainId: selectedItemId,
          selectedConceptId: null,
          selectedInstanceId: null,
        }
      }

      // A concept is selected — show the concept and its referenced domains
      if (selectedItemType === 'concept') {
        const concept = state.library.concepts.find(c => c.id === selectedItemId)
        if (!concept) return EMPTY_CONCEPTUAL_SPACE

        // Collect all domains referenced by this concept's labels
        const referencedDomainIds = new Set(concept.labelRefs.map(ref => ref.domainId))
        const domains = state.library.domains.filter(d => referencedDomainIds.has(d.id))

        return {
          domains,
          concepts: [concept],
          instances: [],
          selectedDomainId: null,
          selectedConceptId: null,
          selectedInstanceId: null,
        }
      }

      return EMPTY_CONCEPTUAL_SPACE
    }

    return {
      domains: state.scene.domains,
      concepts: state.scene.concepts,
      instances: state.scene.instances,
      selectedDomainId: state.scene.selectedDomainId,
      selectedConceptId: state.scene.selectedConceptId,
      selectedInstanceId: state.scene.selectedInstanceId,
    }
  }, [mode, state.library.selectedItemId, state.library.selectedItemType, state.library.domains, state.library.concepts, state.scene.domains, state.scene.concepts, state.scene.instances, state.scene.selectedDomainId, state.scene.selectedConceptId, state.scene.selectedInstanceId])

  const CameraControls = mode === 'library' ? LibraryCameraControls : InspectCameraControls

  return (
    <div className="w-full h-screen">
      <Canvas
        key={mode}
        camera={{ position: [0, 0, 60], fov: 50, near: 0.1, far: 1000 }}
        style={{ background: 'white' }}
        frameloop="always"
        gl={{ logarithmicDepthBuffer: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />
        <ConceptualSpaceVisualizer
          domains={visualizationData.domains}
          concepts={visualizationData.concepts}
          instances={visualizationData.instances}
          selectedDomainId={visualizationData.selectedDomainId}
          selectedConceptId={visualizationData.selectedConceptId}
          selectedInstanceId={visualizationData.selectedInstanceId}
          emptyMessage={mode === 'library'
            ? 'Select a concept or quality domain to view it in 3D.'
            : 'No domains yet. Click "+ Add Domain" to create one.'}
        />
        <CameraControls />
      </Canvas>
    </div>
  )
}
