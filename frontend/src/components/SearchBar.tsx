interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, onSubmit, placeholder }: Props) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        placeholder={placeholder ?? 'Search...'}
        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-200
                   placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1
                   focus:ring-purple-500/30 transition-colors"
      />
      <button
        onClick={onSubmit}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm
                   font-medium transition-colors"
      >
        Search
      </button>
    </div>
  )
}
