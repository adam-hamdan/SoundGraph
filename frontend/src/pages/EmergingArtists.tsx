import { useState } from 'react'
import DataTable from '../components/DataTable'
import PageSpinner from '../components/PageSpinner'
import EmptyState from '../components/EmptyState'
import { Sprout } from 'lucide-react'

export default function EmergingArtists() {
  const [debutFrom, setDebutFrom] = useState('2018')
  const [minListeners, setMinListeners] = useState('500000')
  const [maxWins, setMaxWins] = useState('1')
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const url = `/api/artists/emerging?debut=${debutFrom}&listeners=${minListeners}&maxWins=${maxWins}`
      const res = await fetch(url)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const filters = [
    { label: 'Debut year ≥', value: debutFrom, set: setDebutFrom },
    { label: 'Min monthly listeners', value: minListeners, set: setMinListeners },
    { label: 'Max Grammy wins', value: maxWins, set: setMaxWins },
  ] as const

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="font-mono text-[10px] font-semibold uppercase leading-relaxed tracking-widest text-cyan-500/80">
          A&amp;R
        </p>
        <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-slate-100 sm:text-4xl">
          Emerging artists
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
          Discovery filters backed by <code className="text-cyan-500/80">/api/artists/emerging</code>.
        </p>
      </header>

      <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-7 shadow-lg shadow-black/10 sm:p-9">
        <p className="font-mono text-[10px] font-semibold uppercase leading-relaxed tracking-wider text-slate-500">
          Filters
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {filters.map(({ label, value, set }) => (
            <label key={label} className="flex flex-col gap-2 text-xs font-medium leading-relaxed text-slate-400">
              {label}
              <input
                type="number"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 font-mono text-sm leading-snug text-slate-100 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-7 min-h-[44px] rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-3 text-sm font-semibold leading-snug text-white shadow-lg shadow-cyan-950/30 transition hover:brightness-110"
        >
          Find artists
        </button>
      </div>

      {loading ? (
        <PageSpinner label="Running emerging-artist query…" />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No emerging artists for these filters"
          description="Loosen debut year, listener floor, or award ceiling — or run Find artists after seeding data."
        />
      ) : (
        <DataTable rows={results} />
      )}
    </div>
  )
}
