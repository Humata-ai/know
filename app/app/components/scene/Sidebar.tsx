'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getTabFromPathname } from './sidebar/types'
import type { SidebarView } from './sidebar/types'
import SidebarTabStrip from './sidebar/SidebarTabStrip'
import ScenePanel from './sidebar/ScenePanel'
import LibraryPanel from './sidebar/LibraryPanel'
import ImportExportPanel from './sidebar/ImportExportPanel'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const activeView = getTabFromPathname(pathname)
  const [collapsed, setCollapsed] = useState(false)
  const visibleView = collapsed ? null : activeView

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
    router.push(`/${tab}`)
  }

  return (
    <div className="fixed top-0 left-0 h-full z-30 flex">
      <SidebarTabStrip activeTab={visibleView} onTabClick={handleTabClick} />

      {visibleView && (
        <div className="bg-white/95 backdrop-blur-sm shadow-xl h-full overflow-y-auto w-80 flex flex-col">
          {activeView === 'scene' && <ScenePanel />}
          {activeView === 'library' && <LibraryPanel />}
          {activeView === 'import-export' && <ImportExportPanel />}
        </div>
      )}
    </div>
  )
}
