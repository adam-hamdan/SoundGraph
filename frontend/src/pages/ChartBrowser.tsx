import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import ResultsTable from '../components/ResultsTable'

const VIEWS = ['Chart Entries', 'Genre Dominance', '#1 Hits', 'Multi-Country Tracks']

export default function ChartBrowser() {
  const [view, setView] = useState(0)
  const [country, setCountry] = useState('USA')
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)

  async function load(v = view, c = country) {
    setLoading(true)
    try {
      const endpoints = [
        `/api/charts?country=${encodeURIComponent(c)}`,
        `/api/charts/genres?country=${encodeURIComponent(c)}`,
        `/api/tracks/number-ones`,
        `/api/tracks/multi-country`,
      ]
      const res = await fetch(endpoints[v])
      setResults(await res.json())
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  function handleView(v: number) {
    setView(v)
    load(v, country)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Charts</h1>
        <p className="text-slate-500 text-sm">Explore chart history and genre performance.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v, i) => (
          <button
            key={i}
            onClick={() => handleView(i)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              view === i
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 border border-white/10 hover:text-slate-200'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {(view === 0 || view === 1) && (
        <div className="flex gap-2 items-center">
          <SearchBar
            value={country}
            onChange={setCountry}
            onSubmit={() => load(view, country)}
            placeholder="Country (e.g. USA, UK, Germany)"
          />
        </div>
      )}

      {loading && <p className="text-slate-500 text-sm">Loading…</p>}
      {!loading && <ResultsTable rows={results} />}
    </div>
  )
}
