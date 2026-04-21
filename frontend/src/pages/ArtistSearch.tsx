import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopArtistsTable from '../components/TopArtistsTable'
import PageSpinner from '../components/PageSpinner'
import EmptyState from '../components/EmptyState'
import { Mic2 } from 'lucide-react'

const SEARCH_MODES = [
  { label: 'Name', param: 'name' },
  { label: 'Country', param: 'country' },
  { label: 'Genre', param: 'genre' },
] as const

export default function ArtistSearch() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState(0)
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    void fetchArtists()
  }, [])

  async function fetchArtists(q = '') {
    setLoading(true)
    try {
      const param = q ? `?${SEARCH_MODES[mode].param}=${encodeURIComponent(q)}` : ''
      const res = await fetch(`/api/artists${param}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="font-mono text-[10px] font-semibold uppercase leading-relaxed tracking-widest text-cyan-500/80">
          Directory
        </p>
        <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-slate-100 sm:text-4xl">
          Artists
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
          Search and open full reports — wired to the same API Alvisa configured.
        </p>
      </header>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SEARCH_MODES.map((m, i) => (
            <button
              key={m.param}
              type="button"
              onClick={() => setMode(i)}
              className={[
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition',
                mode === i
                  ? 'bg-cyan-500/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]'
                  : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300',
              ].join(' ')}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void fetchArtists(query)}
            placeholder={`Filter by ${SEARCH_MODES[mode].label.toLowerCase()}…`}
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={() => void fetchArtists(query)}
            className="shrink-0 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-950/30 transition hover:brightness-110"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <PageSpinner label="Fetching artists…" />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Mic2}
          title="No artists match"
          description="Try clearing filters or run a broader search. If the database is empty, seed Artist rows first."
        />
      ) : (
        <TopArtistsTable
          artists={results}
          sortByListeners={false}
          onViewReport={(id) => navigate(`/artist/${id}`)}
        />
      )}
    </div>
  )
}
