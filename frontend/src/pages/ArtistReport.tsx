import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ResultsTable from '../components/ResultsTable'

interface Report {
  profile: Record<string, unknown>[]
  albums: Record<string, unknown>[]
  awards: Record<string, unknown>[]
  chartPeaks: Record<string, unknown>[]
}

export default function ArtistReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/artists/${id}/report`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setReport(data)
      })
      .catch(() => setError('Failed to load report'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-slate-500">Loading report…</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (!report) return null

  const artist = report.profile?.[0]
  const wins = (report.awards ?? []).filter(a => a.outcome === 'Won').length

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-300 text-sm mt-1 transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{String(artist?.name ?? '')}</h1>
          <div className="flex gap-4 mt-1 text-sm text-slate-400">
            <span>{String(artist?.country ?? '')}</span>
            <span>Debut {String(artist?.debut_year ?? '')}</span>
            <span className="text-green-400">{Number(artist?.monthly_listeners ?? 0).toLocaleString()} monthly listeners</span>
            <span className="text-yellow-400">{wins} award win{wins !== 1 ? 's' : ''}</span>
          </div>
          {artist?.genres != null && (
            <p className="text-sm text-purple-400 mt-1">{String(artist.genres)}</p>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Albums</h2>
        <ResultsTable rows={report.albums ?? []} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Award History</h2>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-slate-400">
                <th className="px-3 py-2 text-left">Show</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Year</th>
                <th className="px-3 py-2 text-left">Track</th>
                <th className="px-3 py-2 text-left">Result</th>
              </tr>
            </thead>
            <tbody>
              {(report.awards ?? []).map((row, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="px-3 py-2 text-slate-300">{String(row.award_show)}</td>
                  <td className="px-3 py-2 text-slate-400 max-w-xs truncate">{String(row.category)}</td>
                  <td className="px-3 py-2 text-slate-400">{String(row.year)}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{String(row.track_title ?? '—')}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      row.outcome === 'Won'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {String(row.outcome)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Chart Peaks</h2>
        <ResultsTable rows={report.chartPeaks ?? []} />
      </section>
    </div>
  )
}
