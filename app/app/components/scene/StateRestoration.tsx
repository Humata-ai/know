'use client'

import { useEffect } from 'react'
import { useQualityDomain } from '@/app/store'
import { useToast } from '../ToastProvider'
import { loadFromLocalStorage, clearLocalStorage } from '../shared/localStorage'

export function StateRestoration() {
  const { state, dispatch } = useQualityDomain()
  const { showToast } = useToast()

  // Check localStorage on mount — only runs once thanks to hasRestoredState in the store
  useEffect(() => {
    if (state.scene.hasRestoredState) return

    const savedState = loadFromLocalStorage()

    if (savedState) {
      // Restore scene state (also sets hasRestoredState: true)
      dispatch({ type: 'RESTORE_SCENE_STATE', payload: {
        domains: savedState.domains,
        concepts: savedState.concepts,
        instances: savedState.instances,
        inspectText: savedState.inspectText,
      } })

      // Restore library state (including dictionary words, library domains, concepts, and actions)
      dispatch({ type: 'RESTORE_LIBRARY_STATE', payload: {
        dictionaryWords: savedState.dictionaryWords,
        concepts: savedState.libraryConcepts,
        domains: savedState.libraryDomains,
        actions: savedState.actions,
      } })

      // Show toast with undo button
      showToast('Loaded state from previous session', () => {
        // Undo callback: clear localStorage and restore default state
        clearLocalStorage()

        // Reload the page to get default state
        window.location.reload()
      })
    } else {
      // Nothing to restore, but mark as checked so we don't re-run
      dispatch({ type: 'MARK_RESTORED' })
    }
  }, [state.scene.hasRestoredState, dispatch, showToast])

  return null // This component doesn't render anything
}
