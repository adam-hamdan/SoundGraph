import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  description?: string
  icon?: LucideIcon
}

export default function EmptyState({ title, description, icon: Icon }: Props) {
  const I = Icon
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 px-10 py-20 text-center sm:px-12 sm:py-24">
      {I ? (
        <I className="mb-5 h-11 w-11 shrink-0 text-slate-600" strokeWidth={1.25} aria-hidden />
      ) : null}
      <p className="max-w-md px-2 text-base font-medium leading-snug text-slate-300">{title}</p>
      {description ? (
        <p className="mt-4 max-w-md px-2 text-sm leading-relaxed text-slate-500">{description}</p>
      ) : null}
    </div>
  )
}
