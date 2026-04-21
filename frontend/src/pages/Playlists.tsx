import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import PageSpinner from '../components/PageSpinner'
import EmptyState from '../components/EmptyState'
import { Music2 } from 'lucide-react'

export default function Playlists() {
  const [username, setUsername] = useState('fan_casey')
  const [playlists, setPlaylists] = useState<Record<string, unknown>[]>([])
  const [tracks, setTracks] = useState<Record<string, unknown>[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadPlaylists() {
    setLoading(true)
    setTracks([])
    setSelectedPlaylist('')
    try {
      const res = await fetch(`/api/playlists?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      setPlaylists(Array.isArray(data) ? data : [])
    } catch {
      setPlaylists([])
    } finally {
      setLoading(false)
    }
  }

  async function loadTracks(pid: number) {
    setSelectedPlaylist(String(pid))
    try {
      const res = await fetch(`/api/playlists/${pid}/tracks`)
      const data = await res.json()
      setTracks(Array.isArray(data) ? data : [])
    } catch {
      setTracks([])
    }
  }

  const hints = ['fan_casey', 'journalist_alex', 'ar_rep_morgan']

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="font-mono text-[10px] font-semibold uppercase leading-relaxed tracking-widest text-cyan-500/80">
          Fans
        </p>
        <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-slate-100 sm:text-4xl">
          Playlists
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
          Sample usernames:{' '}
          {hints.map((u, i) => (
            <span key={u}>
              {i > 0 ? ', ' : null}
              <code className="text-cyan-500/80">{u}</code>
            </span>
          ))}
        </p>
      </header>

      <SearchBar
        value={username}
        onChange={setUsername}
        onSubmit={() => void loadPlaylists()}
        placeholder="Username…"
        buttonLabel="Load playlists"
      />

      {loading ? (
        <PageSpinner label="Loading playlists…" />
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No playlists loaded"
          description="Enter a username and load — data comes from /api/playlists."
        />
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {playlists.map((p, i) => {
            const isSelected = selectedPlaylist === String(p.playlist_id)
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => void loadTracks(Number(p.playlist_id))}
                  className={[
                    'w-full rounded-xl border px-5 py-4 text-left transition sm:px-6 sm:py-5',
                    isSelected
                      ? 'border-cyan-500/35 bg-cyan-500/5 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.15)]'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`font-medium ${isSelected ? 'text-cyan-200' : 'text-slate-100'}`}>
                      {String(p.name)}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-slate-500">
                      {String(p.track_count)} tracks
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Created {String(p.created_date)}</p>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {tracks.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Tracks in playlist
          </h2>
          <DataTable rows={tracks} />
        </section>
      ) : null}
    </div>
  )
}
