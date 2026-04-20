import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import ResultsTable from '../components/ResultsTable'

export default function Playlists() {
  const [username, setUsername] = useState('fan_casey')
  const [playlists, setPlaylists] = useState<Record<string, unknown>[]>([])
  const [tracks, setTracks] = useState<Record<string, unknown>[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('')
  const [loading, setLoading] = useState(false)

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Playlists</h1>
        <p className="text-slate-500 text-sm">Browse user playlists. Try: <code className="text-purple-400">fan_casey</code>, <code className="text-purple-400">journalist_alex</code>, <code className="text-purple-400">ar_rep_morgan</code></p>
      </div>

      <SearchBar
        value={username}
        onChange={setUsername}
        onSubmit={loadPlaylists}
        placeholder="Username..."
      />

      {loading && <p className="text-slate-500 text-sm">Loading…</p>}

      {!loading && playlists.length > 0 && (
        <div className="space-y-2">
          {playlists.map((p, i) => (
            <div
              key={i}
              onClick={() => loadTracks(Number(p.playlist_id))}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                selectedPlaylist === String(p.playlist_id)
                  ? 'border-purple-500/40 bg-purple-500/10'
                  : 'border-white/10 bg-white/3 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200">{String(p.name)}</span>
                <span className="text-xs text-slate-500">{String(p.track_count)} tracks</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Created {String(p.created_date)}</p>
            </div>
          ))}
        </div>
      )}

      {tracks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tracks in Playlist</h2>
          <ResultsTable rows={tracks} />
        </div>
      )}
    </div>
  )
}
