interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, onSubmit, placeholder }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, flex: 1 }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        placeholder={placeholder ?? 'Search...'}
        style={{
          flex: 1,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-mid)',
          borderRadius: 8, padding: '8px 14px',
          fontSize: 13, color: 'var(--text-primary)',
          fontFamily: 'DM Sans, sans-serif',
          transition: 'border-color 0.14s',
        }}
      />
      <button
        onClick={onSubmit}
        style={{
          padding: '8px 20px',
          background: 'var(--purple)', color: '#fff',
          borderRadius: 8, fontSize: 13, fontWeight: 600,
          border: 'none', cursor: 'pointer', transition: 'opacity 0.14s',
          fontFamily: 'DM Sans, sans-serif',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Search
      </button>
    </div>
  )
}
