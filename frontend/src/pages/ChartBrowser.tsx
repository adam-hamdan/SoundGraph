import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import ResultsTable from '../components/ResultsTable'

const VIEWS = ['Chart Entries', 'Genre Dominance', '#1 Hits', 'Multi-Country Tracks']

export default function ChartBrowser() {
  const [view, setView]       = useState(0)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="fade-up">
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 28, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', marginBottom: 4,
        }}>
          Charts
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Explore chart history and genre performance.
        </p>
      </div>

      <div className="fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, animationDelay: '40ms' }}>
        {VIEWS.map((v, i) => (
          <button
            key={i}
            onClick={() => handleView(i)}
            style={{
              padding: '5px 14px', borderRadius: 6,
              fontSize: 13, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.14s',
              background: view === i ? 'var(--purple-dim)' : 'transparent',
              color: view === i ? 'var(--purple)' : 'var(--text-secondary)',
              border: `1px solid ${view === i ? 'var(--border-active)' : 'var(--border-mid)'}`,
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {(view === 0 || view === 1) && (
        <div className="fade-up" style={{ animationDelay: '60ms' }}>
          <SearchBar
            value={country}
            onChange={setCountry}
            onSubmit={() => load(view, country)}
            placeholder="Country (e.g. USA, UK, Germany)"
          />
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</p>}
      {!loading && <ResultsTable rows={results} />}
    </div>
  )
}
