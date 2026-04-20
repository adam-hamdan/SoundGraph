import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ResultsTable from '../components/ResultsTable'

interface Report {
  profile:    Record<string, unknown>[]
  albums:     Record<string, unknown>[]
  awards:     Record<string, unknown>[]
  chartPeaks: Record<string, unknown>[]
}

function StatBadge({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '10px 16px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-mid)',
      borderRadius: 8,
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 600, color: color ?? 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
        {value}
      </span>
    </div>
  )
}

export default function ArtistReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report,  setReport]  = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch(`/api/artists/${id}/report`)
      .then(r => r.json())
      .then(data => { if (data.error) setError(data.error); else setReport(data) })
      .catch(() => setError('Failed to load report'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading report…</p>
  if (error)   return <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
  if (!report) return null

  const artist = report.profile?.[0]
  const wins   = (report.awards ?? []).filter(a => a.outcome === 'Won').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* Back + artist header */}
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            alignSelf: 'flex-start',
            fontSize: 12, color: 'var(--text-muted)',
            background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
            transition: 'color 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ← Back
        </button>

        <div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 32, letterSpacing: '-0.025em',
            color: 'var(--text-primary)', marginBottom: 6,
          }}>
            {String(artist?.name ?? '')}
          </h1>
          {artist?.genres != null && (
            <p style={{ fontSize: 13, color: 'var(--purple)', marginBottom: 16 }}>
              {String(artist.genres)}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <StatBadge label="Country"  value={String(artist?.country ?? '—')} />
            <StatBadge label="Debut"    value={String(artist?.debut_year ?? '—')} />
            <StatBadge
              label="Monthly Listeners"
              value={Number(artist?.monthly_listeners ?? 0).toLocaleString('en-US')}
              color="var(--cyan)"
            />
            <StatBadge
              label="Award Wins"
              value={String(wins)}
              color={wins > 0 ? 'var(--yellow)' : undefined}
            />
          </div>
        </div>
      </div>

      {/* Albums */}
      <section className="fade-up" style={{ animationDelay: '60ms' }}>
        <SectionHeader>Albums</SectionHeader>
        <ResultsTable rows={report.albums ?? []} />
      </section>

      {/* Awards */}
      <section className="fade-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader>Award History</SectionHeader>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-mid)' }}>
                {['Show', 'Category', 'Year', 'Track', 'Result'].map(h => (
                  <th key={h} style={{
                    padding: '7px 12px', textAlign: 'left',
                    color: 'var(--text-muted)', fontWeight: 500,
                    fontSize: 10.5, letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(report.awards ?? []).map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent')}
                >
                  <td style={{ padding: '9px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{String(row.award_show)}</td>
                  <td style={{ padding: '9px 12px', color: 'var(--text-secondary)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(row.category)}</td>
                  <td style={{ padding: '9px 12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{String(row.year)}</td>
                  <td style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(row.track_title ?? '—')}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20,
                      background: row.outcome === 'Won' ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.05)',
                      color: row.outcome === 'Won' ? 'var(--yellow)' : 'var(--text-muted)',
                      fontWeight: 500,
                    }}>
                      {String(row.outcome)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Chart Peaks */}
      <section className="fade-up" style={{ animationDelay: '140ms' }}>
        <SectionHeader>Chart Peaks</SectionHeader>
        <ResultsTable rows={report.chartPeaks ?? []} />
      </section>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em',
      textTransform: 'uppercase', color: 'var(--text-muted)',
      fontFamily: 'JetBrains Mono, monospace', marginBottom: 12,
    }}>
      {children}
    </p>
  )
}
