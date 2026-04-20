import { Routes, Route, NavLink } from 'react-router-dom'
import ArtistSearch from './pages/ArtistSearch'
import ArtistReport from './pages/ArtistReport'
import ChartBrowser from './pages/ChartBrowser'
import EmergingArtists from './pages/EmergingArtists'
import Playlists from './pages/Playlists'

function WaveIcon() {
  return (
    <svg width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden="true">
      <rect x="0"  y="5"  width="2" height="3"  rx="1" fill="currentColor" />
      <rect x="3"  y="3"  width="2" height="7"  rx="1" fill="currentColor" />
      <rect x="6"  y="0"  width="2" height="13" rx="1" fill="currentColor" />
      <rect x="9"  y="2"  width="2" height="9"  rx="1" fill="currentColor" />
      <rect x="12" y="4"  width="2" height="5"  rx="1" fill="currentColor" />
      <rect x="15" y="3"  width="2" height="7"  rx="1" fill="currentColor" />
    </svg>
  )
}

const navItems = [
  { to: '/',          label: 'Artists',   emoji: '🎤', end: true  },
  { to: '/charts',    label: 'Charts',    emoji: '📊'              },
  { to: '/emerging',  label: 'Emerging',  emoji: '🌱'              },
  { to: '/playlists', label: 'Playlists', emoji: '🎵'              },
]

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(12,12,24,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 1160, margin: '0 auto', padding: '0 24px',
          height: 52, display: 'flex', alignItems: 'center', gap: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--purple)', flexShrink: 0 }}>
            <WaveIcon />
            <span style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: 15, letterSpacing: '0.01em', color: 'var(--text-primary)',
            }}>
              SoundGraph
            </span>
          </div>

          <nav style={{ display: 'flex', gap: 2 }}>
            {navItems.map(({ to, label, emoji, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                style={({ isActive }) => ({
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 13px', borderRadius: 6,
                  fontSize: 13, fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.14s',
                  background: isActive ? 'var(--purple-dim)' : 'transparent',
                  color: isActive ? 'var(--purple)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--border-active)' : 'transparent'}`,
                })}
              >
                <span style={{ fontSize: 11 }}>{emoji}</span>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 24px' }}>
        <Routes>
          <Route path="/"           element={<ArtistSearch />}   />
          <Route path="/artist/:id" element={<ArtistReport />}   />
          <Route path="/charts"     element={<ChartBrowser />}   />
          <Route path="/emerging"   element={<EmergingArtists />}/>
          <Route path="/playlists"  element={<Playlists />}      />
        </Routes>
      </main>
    </div>
  )
}
