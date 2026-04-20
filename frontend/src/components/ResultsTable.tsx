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

function isNumericCol(col: string): boolean {
  return /listener|stream|count|plays|revenue|sales|peak/i.test(col)
}

export default function ResultsTable({ rows, title }: Props) {
  if (!rows || rows.length === 0) return (
    <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>No results.</p>
  )

  const cols = Object.keys(rows[0])

  return (
    <div>
      {title && (
        <h3 style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          marginBottom: 10, fontFamily: 'JetBrains Mono, monospace',
        }}>
          {title}
        </h3>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-mid)' }}>
              {cols.map(c => (
                <th
                  key={c}
                  style={{
                    padding: '7px 12px', textAlign: 'left',
                    color: 'var(--text-muted)', fontWeight: 500,
                    fontSize: 10.5, letterSpacing: '0.07em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {c.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent')}
              >
                {cols.map(c => (
                  <td
                    key={c}
                    title={fmt(row[c])}
                    style={{
                      padding: '9px 12px',
                      color: isNumericCol(c) ? 'var(--cyan)' : 'var(--text-secondary)',
                      fontFamily: isNumericCol(c) ? 'JetBrains Mono, monospace' : 'inherit',
                      fontSize: isNumericCol(c) ? 12 : 13,
                      maxWidth: 240,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {fmt(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
        {rows.length} row{rows.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
