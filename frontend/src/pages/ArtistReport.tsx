import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import DataTable from '../components/DataTable'
import PageSpinner from '../components/PageSpinner'

interface Report {
  profile: Record<string, unknown>[]
  albums: Record<string, unknown>[]
  awards: Record<string, unknown>[]
  chartPeaks: Record<string, unknown>[]
}

function ProfileStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-5 py-4 sm:px-6 sm:py-5">
      <p className="font-mono text-[10px] font-medium uppercase leading-relaxed tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={[
          'mt-2 font-mono text-lg font-semibold leading-snug tracking-tight sm:text-xl',
          accent ? 'text-cyan-300' : 'text-slate-100',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}

export default function ArtistReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/artists/${id}/report`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) setError(String(data.error))
        else setReport(data)
      })
      .catch(() => setError('Failed to load report'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageSpinner label="Loading artist intelligence…" />
  if (error) {
    return (
      <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">{error}</p>
    )
  }
  if (!report) return null

  const artist = report.profile?.[0]
  const wins = (report.awards ?? []).filter((a) => a.outcome === 'Won').length

  return (
    <div className="space-y-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-cyan-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Back
      </button>

      <header className="space-y-4">
        <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-slate-100 sm:text-4xl">
          {String(artist?.name ?? '')}
        </h1>
        {artist?.genres != null ? (
          <p className="text-sm font-medium leading-relaxed text-teal-400/90 sm:text-base">{String(artist.genres)}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProfileStat label="Country" value={String(artist?.country ?? '—')} />
          <ProfileStat label="Debut year" value={String(artist?.debut_year ?? '—')} />
          <ProfileStat
            label="Monthly listeners"
            value={Number(artist?.monthly_listeners ?? 0).toLocaleString('en-US')}
            accent
          />
          <ProfileStat
            label="Award wins"
            value={String(wins)}
            accent={wins > 0}
          />
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">Albums</h2>
        {(report.albums ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No album rows for this artist.</p>
        ) : (
          <DataTable rows={report.albums ?? []} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">Award history</h2>
        {(report.awards ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No awards recorded.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800/80">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  {['Show', 'Category', 'Year', 'Track', 'Result'].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(report.awards ?? []).map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-900/40">
                    <td className="px-3 py-2.5 font-medium text-slate-200">{String(row.award_show)}</td>
                    <td className="max-w-[240px] truncate px-3 py-2.5 text-slate-400" title={String(row.category)}>
                      {String(row.category)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{String(row.year)}</td>
                    <td className="max-w-[200px] truncate px-3 py-2.5 text-xs text-slate-500">
                      {String(row.track_title ?? '—')}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={[
                          'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                          row.outcome === 'Won'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-slate-800 text-slate-400',
                        ].join(' ')}
                      >
                        {String(row.outcome)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">Chart peaks</h2>
        {(report.chartPeaks ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No chart history for this artist.</p>
        ) : (
          <DataTable rows={report.chartPeaks ?? []} />
        )}
      </section>
    </div>
  )
}
