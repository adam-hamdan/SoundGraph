import { useState } from 'react'
import ResultsTable from '../components/ResultsTable'

export default function EmergingArtists() {
  const [debutFrom,    setDebutFrom]    = useState('2018')
  const [minListeners, setMinListeners] = useState('5000000')
  const [maxWins,      setMaxWins]      = useState('1')
  const [results,      setResults]      = useState<Record<string, unknown>[]>([])
  const [loading,      setLoading]      = useState(false)

  async function load() {
    setLoading(true)
    try {
      const url = `/api/artists/emerging?debut=${debutFrom}&listeners=${minListeners}&maxWins=${maxWins}`
      const res = await fetch(url)
      setResults(await res.json())
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  const filters = [
    { label: 'Debut Year ≥',         value: debutFrom,    set: setDebutFrom    },
    { label: 'Min Monthly Listeners', value: minListeners, set: setMinListeners },
    { label: 'Max Grammy Wins',       value: maxWins,      set: setMaxWins      },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="fade-up">
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 28, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', marginBottom: 4,
        }}>
          Emerging Artists
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          A&amp;R discovery tool — find artists growing before mainstream recognition.
        </p>
      </div>

      <div
        className="fade-up"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-mid)',
          borderRadius: 12, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 20,
          animationDelay: '40ms',
        }}
      >
        <p style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          Filters
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {filters.map(({ label, value, set }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                {label}
              </label>
              <input
                type="number"
                value={value}
                onChange={e => set(e.target.value)}
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-mid)',
                  borderRadius: 8, padding: '7px 12px',
                  fontSize: 13, color: 'var(--text-primary)',
                  fontFamily: 'JetBrains Mono, monospace',
                  transition: 'border-color 0.14s',
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={load}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 20px',
            background: 'var(--purple)', color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'opacity 0.14s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Find Artists
        </button>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</p>}
      {!loading && results.length > 0 && <ResultsTable rows={results} />}
    </div>
  )
}
