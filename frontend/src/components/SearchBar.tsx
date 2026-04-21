interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
  buttonLabel?: string
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  buttonLabel = 'Search',
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder={placeholder ?? 'Search…'}
        className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm leading-snug text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      />
      <button
        type="button"
        onClick={onSubmit}
        className="min-h-[44px] shrink-0 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-3 text-sm font-semibold leading-snug text-white shadow-lg shadow-cyan-950/30 transition hover:brightness-110 active:scale-[0.98]"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
