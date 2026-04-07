'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getTabFromPathname } from './sidebar/types'
import type { SidebarView } from './sidebar/types'
import SidebarTabStrip from './sidebar/SidebarTabStrip'
import InspectPanel from './sidebar/InspectPanel'
import LibraryPanel from './sidebar/LibraryPanel'
import ImportExportPanel from './sidebar/ImportExportPanel'
import { useQualityDomain } from '../../store'

interface SidebarProps {
  hideInspectPanel?: boolean
}

export default function Sidebar({ hideInspectPanel = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeView = getTabFromPathname(pathname)
  const [collapsed, setCollapsed] = useState(false)
  const { state } = useQualityDomain()
  
  // Hide inspect panel when on input page, otherwise use collapsed state
  const visibleView = collapsed ? null : (hideInspectPanel && activeView === 'inspect' ? null : activeView)

  const handleTabClick = (tab: SidebarView) => {
    if (activeView === tab) {
      // If we're in a sub-route (e.g. /library/dictionary), navigate to
      // the tab root first instead of immediately collapsing.
      const isAtTabRoot = pathname === `/${tab}` || pathname === `/${tab}/`
      if (!isAtTabRoot) {
        setCollapsed(false)
        router.push(`/${tab}`)
        return
      }
      setCollapsed((prev) => !prev)
      return
    }
    setCollapsed(false)
    
    // If navigating to inspect tab, check for saved text from state or current URL
    if (tab === 'inspect') {
      // Priority: 1) state, 2) current URL param if we're already on inspect
      const textFromState = state.scene.inspectText
      const textFromUrl = activeView === 'inspect' ? searchParams.get('txt') : null
      const textToUse = textFromState || textFromUrl
      
      if (textToUse) {
        const encodedText = encodeURIComponent(textToUse)
        router.push(`/inspect?txt=${encodedText}`)
      } else {
        router.push(`/${tab}`)
      }
    } else {
      router.push(`/${tab}`)
    }
  }

  return (
    <div className="fixed top-0 left-0 h-full z-30 flex">
      <SidebarTabStrip activeTab={activeView} onTabClick={handleTabClick} />

      {visibleView && (
        <div className="bg-white/95 backdrop-blur-sm shadow-xl h-full overflow-y-auto w-80 flex flex-col">
          {activeView === 'inspect' && <InspectPanel />}
          {activeView === 'library' && <LibraryPanel />}
          {activeView === 'import-export' && <ImportExportPanel />}
        </div>
      )}
    </div>
  )
}
