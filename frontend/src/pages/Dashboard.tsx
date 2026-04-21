import { useNavigate } from 'react-router-dom'
import { Globe2, Hash, Mic2, Trophy } from 'lucide-react'
import { useDashboardData } from '../hooks/useDashboardData'
import StatCard from '../components/StatCard'
import TopArtistsTable from '../components/TopArtistsTable'
import TrendingTracksList from '../components/TrendingTracksList'
import DataTable from '../components/DataTable'
import PageSpinner from '../components/PageSpinner'
import EmptyState from '../components/EmptyState'
import { Database } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { artists, numberOnes, multiCountry, chartEntries, loading, error } = useDashboardData()

  if (loading) {
    return <PageSpinner label="Syncing dashboard with SoundGraph…" />
  }

  if (error) {
    return (
      <EmptyState
        icon={Database}
        title="API unavailable"
        description={error}
      />
    )
  }

  const totalArtists = artists.length
  const totalOnes = numberOnes.length
  const crossMarket = multiCountry.length
  const chartRows = chartEntries.length

  return (
    <div className="space-y-14 sm:space-y-16">
      <header className="space-y-4 sm:space-y-5">
        <p className="font-mono text-[10px] font-semibold uppercase leading-relaxed tracking-widest text-cyan-500/80">
          Overview
        </p>
        <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-slate-100 sm:text-4xl sm:leading-[1.1]">
          Music ecosystem pulse
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base sm:leading-relaxed">
          Real-time aggregates from your existing API routes — artists, #1 hits, cross-market tracks, and USA chart
          history.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-4 xl:gap-7">
        <StatCard
          label="Artists indexed"
          value={totalArtists.toLocaleString('en-US')}
          hint="GET /api/artists"
          icon={Mic2}
        />
        <StatCard
          label="#1 hit rows"
          value={totalOnes.toLocaleString('en-US')}
          hint="GET /api/tracks/number-ones"
          icon={Trophy}
        />
        <StatCard
          label="Multi-country tracks"
          value={crossMarket.toLocaleString('en-US')}
          hint="GET /api/tracks/multi-country"
          icon={Globe2}
        />
        <StatCard
          label="USA chart entries"
          value={chartRows.toLocaleString('en-US')}
          hint="GET /api/charts?country=USA"
          icon={Hash}
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-5 lg:gap-12">
        <div className="min-w-0 lg:col-span-3">
          <TopArtistsTable
            artists={artists}
            onViewReport={(id) => navigate(`/artist/${id}`)}
          />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <TrendingTracksList rows={numberOnes} />
        </div>
      </section>

      <section className="grid gap-10 xl:grid-cols-2 xl:gap-12">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/20 p-7 sm:p-9">
          <h2 className="font-display text-base font-semibold leading-snug text-slate-200 sm:text-lg">
            Cross-market performance
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-500 sm:text-sm">Rows from /api/tracks/multi-country</p>
          <div className="mt-8">
            {multiCountry.length === 0 ? (
              <EmptyState
                title="No multi-country tracks"
                description="The API returned an empty list. Your graph will light up as soon as those rows exist."
              />
            ) : (
              <DataTable rows={multiCountry} maxRows={8} />
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/20 p-7 sm:p-9">
          <h2 className="font-display text-base font-semibold leading-snug text-slate-200 sm:text-lg">
            Chart history sample (USA)
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-500 sm:text-sm">
            First rows from /api/charts — mirrors ChartHistory joins
          </p>
          <div className="mt-8">
            {chartEntries.length === 0 ? (
              <EmptyState
                title="No chart rows for USA"
                description="Try adding ChartHistory data or switch country in the Charts workspace."
              />
            ) : (
              <DataTable rows={chartEntries} maxRows={8} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
