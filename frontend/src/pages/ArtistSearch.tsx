import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'

type Artist = Record<string, unknown>

const SEARCH_MODES = [
  { label: 'Name', param: 'name' },
  { label: 'Country', param: 'country' },
  { label: 'Genre', param: 'genre' },
]

export default function ArtistSearch() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState(0)
  const [results, setResults] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchArtists() }, [])

  async function fetchArtists(q = '') {
    setLoading(true)
    try {
      const param = q ? `?${SEARCH_MODES[mode].param}=${encodeURIComponent(q)}` : ''
      const res = await fetch(`/api/artists${param}`)
      setResults(await res.json())
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  function handleSearch() { fetchArtists(query) }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Artists</h1>
        <p className="text-slate-500 text-sm">Browse and search the SoundGraph artist database.</p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          {SEARCH_MODES.map((m, i) => (
            <button
              key={i}
              onClick={() => setMode(i)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                mode === i
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          placeholder={`Search by ${SEARCH_MODES[mode].label.toLowerCase()}...`}
        />
      </div>

      {loading && <p className="text-slate-500 text-sm">Loading…</p>}

      {!loading && results.length > 0 && (
        <div>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-slate-400">
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Country</th>
                  <th className="px-3 py-2 text-left">Debut</th>
                  <th className="px-3 py-2 text-right">Monthly Listeners</th>
                  <th className="px-3 py-2 text-left">Genres</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((a, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/3">
                    <td className="px-3 py-2 font-medium text-slate-200">{String(a.name)}</td>
                    <td className="px-3 py-2 text-slate-400">{String(a.country)}</td>
                    <td className="px-3 py-2 text-slate-400">{String(a.debut_year)}</td>
                    <td className="px-3 py-2 text-right text-green-400 font-mono text-xs">
                      {Number(a.monthly_listeners).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-xs max-w-xs truncate">
                      {String(a.genres ?? '—')}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => navigate(`/artist/${a.artist_id}`)}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Report →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600 mt-1">{results.length} artists</p>
        </div>
      )}

      {!loading && results.length === 0 && (
        <p className="text-slate-500 text-sm">No artists found.</p>
      )}
    </div>
  )
}
