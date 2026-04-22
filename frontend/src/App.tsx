import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ArtistSearch from './pages/ArtistSearch'
import ArtistReport from './pages/ArtistReport'
import ChartBrowser from './pages/ChartBrowser'
import EmergingArtists from './pages/EmergingArtists'
import Playlists from './pages/Playlists'

const STORAGE_KEY = 'soundgraph-sidebar-collapsed'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <div className="min-w-0 flex-1">
        <main className="mx-auto min-h-screen max-w-[1480px] px-6 pb-20 pt-[max(3rem,env(safe-area-inset-top,0px))] sm:px-8 sm:pb-24 sm:pt-16 lg:px-12 lg:pb-28 lg:pt-[max(4rem,env(safe-area-inset-top,0px))]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/artists" element={<ArtistSearch />} />
            <Route path="/artist/:id" element={<ArtistReport />} />
            <Route path="/charts" element={<ChartBrowser />} />
            <Route path="/emerging" element={<EmergingArtists />} />
            <Route path="/playlists" element={<Playlists />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
