'use client'

import { useEffect, useMemo, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ConceptualSpaceVisualizer from './ConceptualSpaceVisualizer'
import { useQualityDomain } from '@/app/store'
import { isRegion } from '../shared/types'
import type { QualityDomain, Concept, ConceptInstance } from '../shared/types'
import { normalizeToRange } from '@/app/utils/positionCalculations'
import { Vector3 } from 'three'
import type { SidebarView } from './sidebar/types'
import { getDictionaryWordFromPathname } from './sidebar/types'

/**
 * Determines which visualization mode the 3D viewer should be in
 * based on the active tab.
 */
type VisualizationMode = 'scene' | 'library'

function getVisualizationMode(activeTab: SidebarView | null): VisualizationMode {
  if (activeTab === 'library') return 'library'
  return 'scene'
}

/**
 * Camera controls for the scene visualization mode.
 * Animates camera target based on selection state.
 */
function SceneCameraControls() {
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

        // Helper to get range from label dimension (works for both region and point)
        const getLabelRange = (dimId: string): readonly [number, number] => {
          if (isRegion(label)) {
            const labelDim = label.dimensions.find(d => d.dimensionId === dimId)
            return labelDim?.range || domain.dimensions.find(d => d.id === dimId)!.range
          } else {
            // For points, use the value as both min and max
            const labelDim = label.dimensions.find(d => d.dimensionId === dimId)
            if (labelDim) {
              return [labelDim.value, labelDim.value] as const
            }
            // Fallback to domain range
            return domain.dimensions.find(d => d.id === dimId)!.range
          }
        }

        if (domain.dimensions.length === 1) {
          // 1D label
          const dim = domain.dimensions[0]
          const labelRange = getLabelRange(dim.id)
          const minPos = normalizeToRange(labelRange[0], dim.range, [-5, 5])
          const maxPos = normalizeToRange(labelRange[1], dim.range, [-5, 5])
          const centerPos = (minPos + maxPos) / 2

          return new Vector3(
            domainPos[0] + centerPos * scale,
            domainPos[1] + 0.3 * scale,
            domainPos[2]
          )
        } else if (domain.dimensions.length === 2) {
          // 2D label
          const dimX = domain.dimensions[0]
          const dimY = domain.dimensions[1]
          const labelRangeX = getLabelRange(dimX.id)
          const labelRangeY = getLabelRange(dimY.id)

          const minX = normalizeToRange(labelRangeX[0], dimX.range, [-5, 5])
          const maxX = normalizeToRange(labelRangeX[1], dimX.range, [-5, 5])
          const minY = normalizeToRange(labelRangeY[0], dimY.range, [-5, 5])
          const maxY = normalizeToRange(labelRangeY[1], dimY.range, [-5, 5])

          const centerX = (minX + maxX) / 2
          const centerY = (minY + maxY) / 2

          return new Vector3(
            domainPos[0] + centerX * scale,
            domainPos[1] + centerY * scale,
            domainPos[2]
          )
        } else if (domain.dimensions.length === 3) {
          // 3D label
          const ranges = domain.dimensions.map(dim => {
            const labelRange = getLabelRange(dim.id)
            const min = normalizeToRange(labelRange[0], dim.range, [-4, 4])
            const max = normalizeToRange(labelRange[1], dim.range, [-4, 4])
            return { center: (min + max) / 2 }
          })

          return new Vector3(
            domainPos[0] + ranges[0].center * scale,
            domainPos[1] + ranges[1].center * scale,
            domainPos[2] + ranges[2].center * scale
          )
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
        const positions: Vector3[] = []

        labels.forEach(label => {
          const domain = state.scene.domains.find(d => d.id === label.domainId)
          if (!domain || domain.dimensions.length >= 4) return

          const domainPos = domainPositions.get(domain.id)
          if (!domainPos) return

          const scale = 0.5

          // Helper to get range from label dimension (works for both region and point)
          const getLabelRange = (dimId: string): readonly [number, number] => {
            if (isRegion(label)) {
              const labelDim = label.dimensions.find(d => d.dimensionId === dimId)
              return labelDim?.range || domain.dimensions.find(d => d.id === dimId)!.range
            } else {
              // For points, use the value as both min and max
              const labelDim = label.dimensions.find(d => d.dimensionId === dimId)
              if (labelDim) {
                return [labelDim.value, labelDim.value] as const
              }
              // Fallback to domain range
              return domain.dimensions.find(d => d.id === dimId)!.range
            }
          }

          if (domain.dimensions.length === 1) {
            const dim = domain.dimensions[0]
            const labelRange = getLabelRange(dim.id)
            const minPos = normalizeToRange(labelRange[0], dim.range, [-5, 5])
            const maxPos = normalizeToRange(labelRange[1], dim.range, [-5, 5])
            const centerPos = (minPos + maxPos) / 2

            positions.push(new Vector3(
              domainPos[0] + centerPos * scale,
              domainPos[1] + 0.3 * scale,
              domainPos[2]
            ))
          } else if (domain.dimensions.length === 2) {
            const dimX = domain.dimensions[0]
            const dimY = domain.dimensions[1]
            const labelRangeX = getLabelRange(dimX.id)
            const labelRangeY = getLabelRange(dimY.id)

            const minX = normalizeToRange(labelRangeX[0], dimX.range, [-5, 5])
            const maxX = normalizeToRange(labelRangeX[1], dimX.range, [-5, 5])
            const minY = normalizeToRange(labelRangeY[0], dimY.range, [-5, 5])
            const maxY = normalizeToRange(labelRangeY[1], dimY.range, [-5, 5])

            const centerX = (minX + maxX) / 2
            const centerY = (minY + maxY) / 2

            positions.push(new Vector3(
              domainPos[0] + centerX * scale,
              domainPos[1] + centerY * scale,
              domainPos[2]
            ))
          } else if (domain.dimensions.length === 3) {
            const ranges = domain.dimensions.map(dim => {
              const labelRange = getLabelRange(dim.id)
              const min = normalizeToRange(labelRange[0], dim.range, [-4, 4])
              const max = normalizeToRange(labelRange[1], dim.range, [-4, 4])
              return { center: (min + max) / 2 }
            })

            positions.push(new Vector3(
              domainPos[0] + ranges[0].center * scale,
              domainPos[1] + ranges[1].center * scale,
              domainPos[2] + ranges[2].center * scale
            ))
          }
        })

        // Calculate centroid of concept
        if (positions.length > 0) {
          const centroid = new Vector3(0, 0, 0)
          positions.forEach(pos => centroid.add(pos))
          centroid.divideScalar(positions.length)
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
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }, [])

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
  const pathname = usePathname()

  const mode = getVisualizationMode(activeTab)

  // Find the selected word from the URL when in library mode
  const selectedWord = useMemo(() => {
    if (mode !== 'library') return null
    const wordRoute = getDictionaryWordFromPathname(pathname)
    if (!wordRoute) return null
    return state.library.words.find(
      (w) => w.name.toLowerCase().replace(/\s+/g, '-') === wordRoute.wordSlug
    ) || null
  }, [mode, pathname, state.library.words])

  // Select the conceptual space data based on the active tab.
  // Scene tab: uses scene state from the store.
  // Library tab: uses the selected word's conceptual structure.
  const visualizationData = useMemo(() => {
    if (mode === 'library') {
      if (selectedWord) {
        return {
          domains: selectedWord.conceptualStructure.domains,
          concepts: selectedWord.conceptualStructure.concepts,
          instances: selectedWord.conceptualStructure.instances,
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
  }, [mode, selectedWord, state.scene.domains, state.scene.concepts, state.scene.instances, state.scene.selectedDomainId, state.scene.selectedConceptId, state.scene.selectedInstanceId])

  const CameraControls = mode === 'library' ? LibraryCameraControls : SceneCameraControls

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
            ? (selectedWord
              ? 'This word has no conceptual structure defined yet.'
              : 'Select a word to visualize its conceptual space.')
            : 'No domains yet. Click "+ Add Domain" to create one.'}
        />
        <CameraControls />
      </Canvas>
    </div>
  )
}
