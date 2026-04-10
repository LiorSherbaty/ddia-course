export default function HeroNote({ label, children }) {
  return (
    <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-[0_14px_30px_rgba(148,163,184,0.08)]">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">{label}</p>
      <p className="text-sm leading-6 text-[color:var(--color-muted)]">{children}</p>
    </div>
  )
}
