'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Scene from '../components/scene/Scene'
import InspectInput from '../components/scene/InspectInput'
import Sidebar from '../components/scene/Sidebar'
import { StateRestoration } from '../components/scene/StateRestoration'
import { getTabFromPathname } from '../components/scene/sidebar/types'

export default function TabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = getTabFromPathname(pathname)

  // Show InspectInput only on /inspect page without query parameters
  const showInspectInput = activeTab === 'inspect' && !searchParams.get('txt')

  return (
    <div className="relative w-full h-screen">
      <StateRestoration />
      <Sidebar hideInspectPanel={showInspectInput} />
      {showInspectInput ? (
        <InspectInput />
      ) : (
        <Scene activeTab={activeTab} />
      )}
      {children}
    </div>
  )
}
