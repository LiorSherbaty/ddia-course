export default function TradeOffBlock({ block }) {
  return (
    <div className="my-5 overflow-hidden rounded-[22px] border border-[color:var(--color-faint)] bg-white">
      <div className="grid grid-cols-1 divide-y divide-[color:var(--color-faint)] md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="p-5">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            {block.left.label}
          </p>
          <ul className="space-y-2">
            {block.left.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-[15px] leading-7 text-[color:var(--color-muted)]">
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[color:var(--color-accent)]" />
                <span className="flex-1">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5 bg-[color:var(--color-accent-soft)]/40">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-amber-deep)]">
            {block.right.label}
          </p>
          <ul className="space-y-2">
            {block.right.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-[15px] leading-7 text-[color:var(--color-muted)]">
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[color:var(--color-amber-deep)]" />
                <span className="flex-1">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
