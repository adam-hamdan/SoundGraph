import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type Artist = Record<string, unknown>

const SEARCH_MODES = [
  { label: 'Name',    param: 'name'    },
  { label: 'Country', param: 'country' },
  { label: 'Genre',   param: 'genre'   },
]

const COL_HEADERS = ['Name', 'Country', 'Debut', 'Monthly Listeners', 'Genres', '']

export default function ArtistSearch() {
  const [query, setQuery]     = useState('')
  const [mode, setMode]       = useState(0)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Page header */}
      <div className="fade-up" style={{ animationDelay: '0ms' }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 28, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', marginBottom: 4,
        }}>
          Artists
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Browse and search the SoundGraph artist database.
        </p>
      </div>

      {/* Search controls */}
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 10, animationDelay: '40ms' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {SEARCH_MODES.map((m, i) => (
            <button
              key={i}
              onClick={() => setMode(i)}
              style={{
                padding: '4px 14px', borderRadius: 20,
                fontSize: 12, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.14s',
                background: mode === i ? 'var(--purple-dim)' : 'transparent',
                color: mode === i ? 'var(--purple)' : 'var(--text-muted)',
                border: `1px solid ${mode === i ? 'var(--border-active)' : 'transparent'}`,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchArtists(query)}
            placeholder={`Search by ${SEARCH_MODES[mode].label.toLowerCase()}...`}
            style={{
              flex: 1,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-mid)',
              borderRadius: 8, padding: '8px 14px',
              fontSize: 13, color: 'var(--text-primary)',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'border-color 0.14s',
            }}
          />
          <button
            onClick={() => fetchArtists(query)}
            style={{
              padding: '8px 20px',
              background: 'var(--purple)', color: '#fff',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'opacity 0.14s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Search
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</p>
      )}

      {/* Table */}
      {!loading && results.length > 0 && (
        <div className="fade-up" style={{ animationDelay: '80ms' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-mid)' }}>
                  {COL_HEADERS.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '7px 12px',
                        textAlign: i === 3 ? 'right' : 'left',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                        fontSize: 10.5,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        fontFamily: 'JetBrains Mono, monospace',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((a, i) => (
                  <ArtistRow
                    key={i}
                    artist={a}
                    index={i}
                    onReport={() => navigate(`/artist/${a.artist_id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            {results.length} artist{results.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {!loading && results.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No artists found.</p>
      )}
    </div>
  )
}

function ArtistRow({ artist: a, index: i, onReport }: {
  artist: Artist
  index: number
  onReport: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--border)',
        background: hovered ? 'var(--bg-surface)' : i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent',
        transition: 'background 0.12s',
        animation: `fadeUp 0.22s ease ${Math.min(i * 0.018, 0.32)}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: '9px 12px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
        {String(a.name)}
      </td>
      <td style={{ padding: '9px 12px', color: 'var(--text-secondary)' }}>
        {String(a.country)}
      </td>
      <td style={{
        padding: '9px 12px', color: 'var(--text-secondary)',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
      }}>
        {String(a.debut_year)}
      </td>
      <td style={{
        padding: '9px 12px', textAlign: 'right',
        color: 'var(--cyan)',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        {Number(a.monthly_listeners).toLocaleString('en-US')}
      </td>
      <td style={{
        padding: '9px 12px', color: 'var(--text-muted)', fontSize: 12,
        maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {String(a.genres ?? '—')}
      </td>
      <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
        <button
          onClick={onReport}
          style={{
            fontSize: 12, color: 'var(--purple)',
            background: 'none', border: 'none',
            cursor: 'pointer', fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif',
            opacity: hovered ? 1 : 0.65,
            transition: 'opacity 0.12s',
            padding: 0,
          }}
        >
          Report →
        </button>
      </td>
    </tr>
  )
}
