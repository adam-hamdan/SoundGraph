import { Disc3 } from 'lucide-react'
import { pickString } from '../lib/api'
import EmptyState from './EmptyState'
import PageSpinner from './PageSpinner'

export interface TrendingTracksListProps {
  rows: Record<string, unknown>[]
  loading?: boolean
  subtitle?: string
}

export default function TrendingTracksList({ rows, loading, subtitle }: TrendingTracksListProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-8">
        <PageSpinner label="Loading chart-topping tracks…" className="py-14" />
      </div>
    )
  }

  if (!rows.length) {
    return (
      <EmptyState
        icon={Disc3}
        title="No #1 track data yet"
        description="Data comes from /api/tracks/number-ones. Populate ChartHistory and related tables to see results."
      />
    )
  }

  const slice = rows.slice(0, 10)

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 shadow-lg shadow-black/10">
      <div className="border-b border-slate-800/80 px-6 py-6 sm:px-8 sm:py-7">
        <h2 className="font-display text-base font-semibold leading-snug text-slate-100 sm:text-lg">#1 hits snapshot</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {subtitle ?? 'From your number-ones endpoint — not mock data.'}
        </p>
      </div>
      <ul className="divide-y divide-slate-800/80">
        {slice.map((row, i) => {
          const title = pickString(row, ['track_title', 'title', 'name'])
          const artist = pickString(row, ['artist_name', 'artist', 'name'])
          const country = pickString(row, ['country', 'chart_country'])
          const when = pickString(row, ['chart_date', 'date', 'week'])
          const line2 = [artist !== '—' ? artist : null, country !== '—' ? country : null, when !== '—' ? when : null]
            .filter(Boolean)
            .join(' · ')

          return (
            <li
              key={i}
              className="flex gap-4 px-6 py-4 transition-colors hover:bg-slate-800/25 sm:px-8 sm:py-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 font-mono text-[11px] font-semibold text-cyan-400/90 tabular-nums">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="truncate font-medium leading-snug text-slate-100">{title}</p>
                {line2 ? <p className="mt-1.5 truncate text-xs leading-relaxed text-slate-500">{line2}</p> : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
