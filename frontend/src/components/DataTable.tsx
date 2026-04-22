interface Props {
  rows: Record<string, unknown>[]
  title?: string
  maxRows?: number
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

function isNumericCol(col: string): boolean {
  return /listener|stream|count|plays|revenue|sales|peak|position|duration/i.test(col)
}

export default function DataTable({ rows, title, maxRows }: Props) {
  if (!rows || rows.length === 0) {
    return (
      <p className="text-sm italic text-slate-500">No rows to display.</p>
    )
  }

  const displayRows = typeof maxRows === 'number' ? rows.slice(0, maxRows) : rows
  const cols = Object.keys(displayRows[0])

  return (
    <div>
      {title ? (
        <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase leading-relaxed tracking-wider text-slate-500">
          {title}
        </h3>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-slate-800/80">
        <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              {cols.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap px-4 py-3.5 font-mono text-[10px] font-medium uppercase leading-relaxed tracking-wider text-slate-500"
                >
                  {c.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-800/60 bg-slate-950/40 transition-colors hover:bg-slate-900/60"
              >
                {cols.map((c) => (
                  <td
                    key={c}
                    title={fmt(row[c])}
                    className={[
                      'max-w-[240px] truncate px-4 py-3.5 leading-snug',
                      isNumericCol(c)
                        ? 'font-mono text-xs tabular-nums text-cyan-300/90'
                        : 'text-slate-300',
                    ].join(' ')}
                  >
                    {fmt(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
        {displayRows.length} row{displayRows.length !== 1 ? 's' : ''}
        {typeof maxRows === 'number' && rows.length > maxRows
          ? ` (showing first ${maxRows} of ${rows.length})`
          : ''}
      </p>
    </div>
  )
}
