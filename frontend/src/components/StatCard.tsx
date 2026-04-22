import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  trend?: string
}

export default function StatCard({ label, value, hint, icon: Icon, trend }: Props) {
  return (
    <div className="group relative rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950 shadow-lg shadow-black/20 transition hover:border-cyan-500/20 hover:shadow-cyan-950/20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-cyan-500/5 blur-2xl transition group-hover:bg-cyan-400/10" />
      </div>
      <div className="relative flex items-start justify-between gap-4 p-7 sm:p-8">
        <div className="min-w-0 py-0.5">
          <p className="text-[11px] font-semibold uppercase leading-relaxed tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-3 font-mono text-2xl font-semibold leading-none tracking-tight text-slate-100 tabular-nums sm:text-[1.75rem]">
            {value}
          </p>
          {hint ? (
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{hint}</p>
          ) : null}
          {trend ? (
            <p className="mt-3 text-xs font-medium leading-relaxed text-teal-400/90">{trend}</p>
          ) : null}
        </div>
        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-cyan-400">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </div>
  )
}
