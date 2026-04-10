export default function RadworkBlock({ block }) {
  return (
    <div className="my-4 rounded-[22px] border border-[color:var(--color-faint)] bg-white/85 px-4 py-3">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">RadWork Transfer</p>
      <p className="text-[15px] leading-7 text-[color:var(--color-muted)]">{block.text}</p>
    </div>
  )
}
