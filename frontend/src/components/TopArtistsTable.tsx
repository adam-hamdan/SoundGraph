import { ArrowUpRight, Users } from 'lucide-react'
import { pickNumber, pickString } from '../lib/api'
import EmptyState from './EmptyState'
import PageSpinner from './PageSpinner'

export interface TopArtistsTableProps {
  artists: Record<string, unknown>[]
  loading?: boolean
  onViewReport: (artistId: string | number) => void
  /** When true (default), sort by monthly listeners and cap rows. */
  sortByListeners?: boolean
  maxRows?: number
}

function compareByMonthlyListeners(a: Record<string, unknown>, b: Record<string, unknown>) {
  return pickNumber(b, ['monthly_listeners']) - pickNumber(a, ['monthly_listeners'])
}

export default function TopArtistsTable({
  artists,
  loading,
  onViewReport,
  sortByListeners = true,
  maxRows,
}: TopArtistsTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-8">
        <PageSpinner label="Loading artists…" className="py-14" />
      </div>
    )
  }

  if (!artists.length) {
    return (
      <EmptyState
        icon={Users}
        title="No artists in the database"
        description="Once your Artist table has rows, they will appear here ranked by monthly listeners."
      />
    )
  }

  const sorted = sortByListeners
    ? [...artists].sort(compareByMonthlyListeners).slice(0, maxRows ?? 12)
    : maxRows != null
      ? artists.slice(0, maxRows)
      : artists

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 shadow-lg shadow-black/10">
      <div className="border-b border-slate-800/80 px-6 py-6 sm:px-8 sm:py-7">
        <h2 className="font-display text-base font-semibold leading-snug text-slate-100 sm:text-lg">
          {sortByListeners ? 'Top artists' : 'Artist results'}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {sortByListeners
            ? 'Ranked by monthly listeners from '
            : 'Live data from '}
          <code className="text-cyan-500/80">/api/artists</code>
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50">
              <th className="px-5 py-4 font-mono text-[10px] font-medium uppercase leading-relaxed tracking-wider text-slate-500">
                #
              </th>
              <th className="px-4 py-4 font-mono text-[10px] font-medium uppercase leading-relaxed tracking-wider text-slate-500">
                Artist
              </th>
              <th className="px-4 py-4 font-mono text-[10px] font-medium uppercase leading-relaxed tracking-wider text-slate-500">
                Country
              </th>
              <th className="px-4 py-4 font-mono text-[10px] font-medium uppercase leading-relaxed tracking-wider text-slate-500">
                Debut
              </th>
              <th className="px-4 py-4 text-right font-mono text-[10px] font-medium uppercase leading-relaxed tracking-wider text-slate-500">
                Listeners
              </th>
              <th className="px-4 py-4 font-mono text-[10px] font-medium uppercase leading-relaxed tracking-wider text-slate-500">
                Genres
              </th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => {
              const id = a.artist_id
              return (
                <tr
                  key={String(id ?? i)}
                  className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500 tabular-nums">
                    {i + 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium leading-snug text-slate-100">
                    {pickString(a, ['name'])}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 leading-snug text-slate-400">{pickString(a, ['country'])}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-slate-400 tabular-nums">
                    {pickString(a, ['debut_year'])}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-xs font-medium tabular-nums text-cyan-300/90">
                    {pickNumber(a, ['monthly_listeners']).toLocaleString('en-US')}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-4 text-xs leading-snug text-slate-500" title={pickString(a, ['genres'])}>
                    {pickString(a, ['genres']) === '—' ? '—' : pickString(a, ['genres'])}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (id == null) return
                        if (typeof id === 'number' || typeof id === 'string') onViewReport(id)
                        else onViewReport(String(id))
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-cyan-400/90 transition hover:bg-cyan-500/10 hover:text-cyan-300"
                    >
                      Report
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
