export default function MetaChip({ children }) {
  return (
    <span className="rounded-full border border-[color:var(--color-accent)]/20 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent-deep)]">
      {children}
    </span>
  )
}
