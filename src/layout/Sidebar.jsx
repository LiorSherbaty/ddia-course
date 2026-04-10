import { DAYS } from '../data/course'
import { resetProgress } from '../lib/storage'
import { CloseIcon } from '../ui/Icons'

export default function Sidebar({ currentView, setView, progress, mobileOpen, setMobileOpen }) {
  const completedCount = progress.completedDays.length
  const pct = Math.round((completedCount / DAYS.length) * 100)

  const navDays = DAYS.map(d => ({ id: `day-${d.id}`, label: d.shortTitle, sub: d.theme, num: d.id }))
  const navBonus = [
    { id: 'memory-map', label: 'Memory Map', sub: 'Quick reference' },
    { id: 'interview-qs', label: '25 Questions', sub: 'Practice & track' },
    { id: 'crash', label: 'One Day Plan', sub: 'Last-minute prep' },
  ]

  const handleNav = (id) => {
    setView(id)
    setMobileOpen(false)
  }

  const NavBtn = ({ item, isBonus }) => {
    const active = currentView === item.id
    const done = !isBonus && progress.completedDays.includes(item.num)
    return (
      <button onClick={() => handleNav(item.id)}
        className={`group flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition-all ${active ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-white shadow-[0_16px_36px_rgba(13,95,95,0.24)]' : 'border-transparent bg-transparent text-[color:var(--color-muted)] hover:border-[color:var(--color-faint)] hover:bg-white/82 hover:text-[color:var(--color-ink)]'}`}>
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${active ? 'bg-white/18 text-white' : done ? 'bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]' : 'bg-[color:#f5efe3] text-[color:var(--color-muted)] group-hover:bg-[color:var(--color-accent-soft)] group-hover:text-[color:var(--color-accent)]'}`}>
          {done ? '✓' : isBonus ? '·' : item.num}
        </div>
        <div className="min-w-0">
          <p className={`truncate text-sm font-medium ${active ? 'text-white' : ''}`}>{item.label}</p>
          <p className={`text-xs ${active ? 'text-[color:var(--color-faint)]' : 'text-[color:#9a9386]'}`}>{item.sub}</p>
        </div>
      </button>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5">
        <div className="surface-panel rounded-[28px] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent)]">Study Companion</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-[color:var(--color-ink)]">DDIA</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
            A focused system design prep course for mid-level .NET engineers.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-[color:var(--color-muted)]">Progress</span>
              <span className="font-mono text-[color:var(--color-accent)]">{completedCount}/{DAYS.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-[color:var(--color-faint)] bg-[color:var(--color-accent-soft)]">
              <div className="progress-fill h-full rounded-full bg-gradient-to-r from-[color:var(--color-amber)] to-[color:var(--color-accent)]" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[color:#9a9386]">
              <span>{pct}% complete</span>
              <span>Auto-saved</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-5">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:#9a9386]">7 Day Plan</p>
          <div className="mt-2 space-y-1.5">
            {navDays.map(item => <NavBtn key={item.id} item={item} isBonus={false} />)}
          </div>
        </div>

        <div className="mt-5 border-t border-[color:var(--color-faint)] pt-5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:#9a9386]">Bonus Views</p>
          <div className="mt-2 space-y-1.5">
            {navBonus.map(item => <NavBtn key={item.id} item={item} isBonus={true} />)}
          </div>
        </div>
      </nav>

      <div className="px-4 pb-4 pt-2">
        <button onClick={() => {
          if (confirm('Reset all progress? This cannot be undone.')) {
            resetProgress(); window.location.reload()
          }
        }} className="w-full rounded-full border border-[color:var(--color-faint)] bg-white/72 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-accent)]/30 hover:text-[color:var(--color-ink)]">
          Reset Progress
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[19rem] flex-shrink-0 border-r border-white/70 bg-white/55 backdrop-blur-xl lg:flex xl:w-[20.5rem]">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <>
          <div className="sidebar-overlay lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-[22rem] flex-col border-r border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-xl lg:hidden">
            <div className="px-4 pt-4">
              <button onClick={() => setMobileOpen(false)} className="ml-auto flex rounded-full border border-[color:var(--color-faint)] bg-white/80 p-2 text-[color:var(--color-muted)]">
                <CloseIcon />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
