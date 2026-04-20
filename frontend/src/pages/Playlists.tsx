import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import ResultsTable from '../components/ResultsTable'

export default function Playlists() {
  const [username,         setUsername]         = useState('fan_casey')
  const [playlists,        setPlaylists]        = useState<Record<string, unknown>[]>([])
  const [tracks,           setTracks]           = useState<Record<string, unknown>[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('')
  const [loading,          setLoading]          = useState(false)

  async function loadPlaylists() {
    setLoading(true)
    setTracks([])
    try {
      const res = await fetch(`/api/playlists?username=${encodeURIComponent(username)}`)
      setPlaylists(await res.json())
    } catch { setPlaylists([]) }
    finally { setLoading(false) }
  }

  async function loadTracks(pid: number) {
    setSelectedPlaylist(String(pid))
    const res = await fetch(`/api/playlists/${pid}/tracks`)
    setTracks(await res.json())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="fade-up">
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 28, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', marginBottom: 4,
        }}>
          Playlists
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Browse user playlists.{' '}
          Try:{' '}
          {['fan_casey', 'journalist_alex', 'ar_rep_morgan'].map((u, i) => (
            <span key={u}>
              {i > 0 && ', '}
              <code style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                color: 'var(--purple)', background: 'var(--purple-dim)',
                padding: '1px 6px', borderRadius: 4,
              }}>
                {u}
              </code>
            </span>
          ))}
        </p>
      </div>

      <div className="fade-up" style={{ animationDelay: '40ms' }}>
        <SearchBar
          value={username}
          onChange={setUsername}
          onSubmit={loadPlaylists}
          placeholder="Username..."
        />
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</p>}

      {!loading && playlists.length > 0 && (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 6, animationDelay: '60ms' }}>
          {playlists.map((p, i) => {
            const isSelected = selectedPlaylist === String(p.playlist_id)
            return (
              <div
                key={i}
                onClick={() => loadTracks(Number(p.playlist_id))}
                style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.14s',
                  background: isSelected ? 'var(--purple-dim)' : 'var(--bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--border-active)' : 'var(--border-mid)'}`,
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-mid)'
                  e.currentTarget.style.background = isSelected ? 'var(--purple-dim)' : 'var(--bg-raised)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isSelected ? 'var(--purple-dim)' : 'var(--bg-surface)'
                  e.currentTarget.style.borderColor = isSelected ? 'var(--border-active)' : 'var(--border-mid)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, color: isSelected ? 'var(--purple)' : 'var(--text-primary)', fontSize: 14 }}>
                    {String(p.name)}
                  </span>
                  <span style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {String(p.track_count)} tracks
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  Created {String(p.created_date)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {tracks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Tracks in Playlist
          </p>
          <ResultsTable rows={tracks} />
        </div>
      )}
    </div>
  )
}
