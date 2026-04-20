import { useState } from 'react'
import ResultsTable from '../components/ResultsTable'

export default function EmergingArtists() {
  const [debutFrom, setDebutFrom] = useState('2018')
  const [minListeners, setMinListeners] = useState('5000000')
  const [maxWins, setMaxWins] = useState('1')
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const url = `/api/artists/emerging?debut=${debutFrom}&listeners=${minListeners}&maxWins=${maxWins}`
      const res = await fetch(url)
      setResults(await res.json())
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Emerging Artists</h1>
        <p className="text-slate-500 text-sm">A&amp;R discovery tool — find artists growing before mainstream recognition.</p>
      </div>

      <div className="bg-white/3 border border-white/10 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Debut Year ≥', value: debutFrom, set: setDebutFrom },
            { label: 'Min Monthly Listeners', value: minListeners, set: setMinListeners },
            { label: 'Max Grammy Wins', value: maxWins, set: setMaxWins },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-xs text-slate-500 mb-1">{label}</label>
              <input
                type="number"
                value={value}
                onChange={e => set(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
                           text-slate-200 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          ))}
        </div>
        <button
          onClick={load}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Find Artists
        </button>
      </div>

      {loading && <p className="text-slate-500 text-sm">Loading…</p>}
      {!loading && results.length > 0 && <ResultsTable rows={results} />}
    </div>
  )
}
