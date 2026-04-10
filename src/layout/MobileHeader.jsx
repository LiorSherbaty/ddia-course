import { MenuIcon } from '../ui/Icons'

export default function MobileHeader({ setMobileOpen }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/70 bg-white/70 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button onClick={() => setMobileOpen(true)} className="rounded-full border border-[color:var(--color-faint)] bg-white/80 p-2 text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-accent)]/30 hover:text-[color:var(--color-ink)]">
        <MenuIcon />
      </button>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">DDIA Course</p>
        <h1 className="text-sm font-semibold text-[color:var(--color-ink)]">System Design Interview Prep</h1>
      </div>
    </header>
  )
}
