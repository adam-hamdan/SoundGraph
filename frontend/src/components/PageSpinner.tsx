interface Props {
  label?: string
  className?: string
}

export default function PageSpinner({ label = 'Loading…', className = '' }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 py-24 text-slate-400 sm:py-28 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] animate-spin"
        aria-hidden
      />
      <p className="max-w-sm px-4 text-center text-sm font-medium leading-relaxed text-slate-500">{label}</p>
    </div>
  )
}
