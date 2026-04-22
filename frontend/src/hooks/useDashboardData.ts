import { useEffect, useState } from 'react'
import { asRecordArray } from '../lib/api'

export interface DashboardDataState {
  artists: Record<string, unknown>[]
  numberOnes: Record<string, unknown>[]
  multiCountry: Record<string, unknown>[]
  chartEntries: Record<string, unknown>[]
  loading: boolean
  error: string | null
}

const initial: DashboardDataState = {
  artists: [],
  numberOnes: [],
  multiCountry: [],
  chartEntries: [],
  loading: true,
  error: null,
}

export function useDashboardData(): DashboardDataState {
  const [state, setState] = useState<DashboardDataState>(initial)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }))

      try {
        const [a, b, c, d] = await Promise.all([
          fetch('/api/artists'),
          fetch('/api/tracks/number-ones'),
          fetch('/api/tracks/multi-country'),
          fetch('/api/charts?country=USA'),
        ])

        if (cancelled) return

        const artistsJson = await a.json().catch(() => null)
        const onesJson = await b.json().catch(() => null)
        const multiJson = await c.json().catch(() => null)
        const chartsJson = await d.json().catch(() => null)

        if (cancelled) return

        setState({
          artists: asRecordArray(artistsJson),
          numberOnes: asRecordArray(onesJson),
          multiCountry: asRecordArray(multiJson),
          chartEntries: asRecordArray(chartsJson),
          loading: false,
          error: null,
        })
      } catch {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: 'Could not reach the SoundGraph API. Is the backend running on port 8080?',
          }))
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
