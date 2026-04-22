import { useEffect, useState } from 'react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import PageSpinner from '../components/PageSpinner'
import EmptyState from '../components/EmptyState'
import { LineChart } from 'lucide-react'

const VIEWS = ['Chart Entries', 'Genre Dominance', '#1 Hits', 'Multi-Country Tracks'] as const

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
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(0, country)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial chart entries only
  }, [])

  function handleView(v: number) {
    setView(v)
    void load(v, country)
  }

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="font-mono text-[10px] font-semibold uppercase leading-relaxed tracking-widest text-cyan-500/80">
          Charts
        </p>
        <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-slate-100 sm:text-4xl">
          Chart intelligence
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
          ChartHistory, genre breakdown, #1s, and cross-market tracks from the API.
        </p>
      </header>

      <div className="flex flex-wrap gap-2.5">
        {VIEWS.map((v, i) => (
          <button
            key={v}
            type="button"
            onClick={() => handleView(i)}
            className={[
              'rounded-lg px-4 py-3 text-xs font-medium leading-snug transition',
              view === i
                ? 'bg-cyan-500/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]'
                : 'border border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200',
            ].join(' ')}
          >
            {v}
          </button>
        ))}
      </div>

      {(view === 0 || view === 1) && (
        <SearchBar
          value={country}
          onChange={setCountry}
          onSubmit={() => void load(view, country)}
          placeholder="Country (e.g. USA, UK, Germany)"
          buttonLabel="Load"
        />
      )}

      {loading ? (
        <PageSpinner label="Loading chart data…" />
      ) : results.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title="No rows for this view"
          description="Try another country or ensure ChartHistory and related tables are populated."
        />
      ) : (
        <DataTable rows={results} />
      )}
    </div>
  )
}
