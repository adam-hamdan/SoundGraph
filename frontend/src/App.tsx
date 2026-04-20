import { Routes, Route, NavLink } from 'react-router-dom'
import ArtistSearch from './pages/ArtistSearch'
import ArtistReport from './pages/ArtistReport'
import ChartBrowser from './pages/ChartBrowser'
import EmergingArtists from './pages/EmergingArtists'
import Playlists from './pages/Playlists'

const navItems = [
  { to: '/', label: '🔍 Artists', end: true },
  { to: '/charts', label: '📊 Charts' },
  { to: '/emerging', label: '🚀 Emerging' },
  { to: '/playlists', label: '🎵 Playlists' },
]

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f0f13] text-slate-200">
      <header className="border-b border-white/10 bg-[#0f0f13]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-bold text-lg text-purple-400 tracking-tight">SoundGraph</span>
          <nav className="flex gap-1">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ArtistSearch />} />
          <Route path="/artist/:id" element={<ArtistReport />} />
          <Route path="/charts" element={<ChartBrowser />} />
          <Route path="/emerging" element={<EmergingArtists />} />
          <Route path="/playlists" element={<Playlists />} />
        </Routes>
      </main>
    </div>
  )
}
