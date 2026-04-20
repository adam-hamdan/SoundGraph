interface Props {
  rows: Record<string, unknown>[]
  title?: string
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'number' && v > 1_000_000) {
    return v >= 1_000_000_000
      ? (v / 1_000_000_000).toFixed(1) + 'B'
      : (v / 1_000_000).toFixed(1) + 'M'
  }
  return String(v)
}

export default function ResultsTable({ rows, title }: Props) {
  if (!rows || rows.length === 0) return (
    <p className="text-slate-500 text-sm italic">No results.</p>
  )

  const cols = Object.keys(rows[0])

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-slate-400">
              {cols.map(c => (
                <th key={c} className="px-3 py-2 text-left font-medium whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                {cols.map(c => (
                  <td key={c} className="px-3 py-2 text-slate-300 max-w-xs truncate" title={fmt(row[c])}>
                    {fmt(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-600 mt-1">{rows.length} row{rows.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
