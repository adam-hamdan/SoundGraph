import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ChevronLeft, ChevronRight, LayoutDashboard, LineChart, Mic2, Music2, Radio, Sprout } from 'lucide-react'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

const nav: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/artists', label: 'Artists', icon: Mic2, end: true },
  { to: '/charts', label: 'Charts', icon: LineChart },
  { to: '/emerging', label: 'Emerging', icon: Sprout },
  { to: '/playlists', label: 'Playlists', icon: Music2 },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={[
        'sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-md',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-[4.5rem]' : 'w-64 min-w-[16rem]',
      ].join(' ')}
    >
      <div
        className={[
          'flex shrink-0 items-center border-b border-slate-800/80',
          collapsed ? 'flex-col gap-2 px-2 py-4' : 'min-h-[4.25rem] justify-between gap-3 px-4 py-3.5',
        ].join(' ')}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden pr-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-600/10 text-cyan-400">
            <Radio className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold tracking-tight text-slate-100">SoundGraph</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Trend analytics
              </p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 transition',
            'hover:border-slate-700 hover:bg-slate-800/80 hover:text-cyan-300',
            collapsed ? '' : 'self-center',
          ].join(' ')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>

      <nav className={['flex flex-1 flex-col gap-1.5 overflow-y-auto', collapsed ? 'p-2.5' : 'p-4'].join(' ')}>
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              [
                'flex items-center rounded-lg text-sm font-medium transition',
                collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-3.5',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
              ].join(' ')
            }
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
            {!collapsed ? <span>{label}</span> : null}
          </NavLink>
        ))}
      </nav>

      {!collapsed ? (
        <div className="shrink-0 border-t border-slate-800/80 p-5">
          <p className="text-[10px] leading-relaxed text-slate-600">
            Live data from your SoundGraph database via <span className="text-slate-500">/api</span>
          </p>
        </div>
      ) : null}
    </aside>
  )
}
