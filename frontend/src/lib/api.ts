/** Normalize API JSON to a row array (handles error objects or non-arrays). */
export function asRecordArray(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object')
}

export function pickString(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k]
    if (v !== null && v !== undefined && String(v).trim() !== '') return String(v)
  }
  return '—'
}

export function pickNumber(row: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const k of keys) {
    const v = row[k]
    if (typeof v === 'number' && !Number.isNaN(v)) return v
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v)
      if (!Number.isNaN(n)) return n
    }
  }
  return fallback
}
