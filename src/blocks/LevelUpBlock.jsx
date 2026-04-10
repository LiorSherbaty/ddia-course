export default function LevelUpBlock({ block }) {
  const levels = [
    { label: 'Weak', text: block.weak, opacity: 0.55, weight: 400, border: 'rgba(13,95,95,0.2)' },
    { label: 'Strong', text: block.strong, opacity: 0.85, weight: 500, border: 'rgba(13,95,95,0.5)' },
    { label: 'Senior', text: block.senior, opacity: 1, weight: 600, border: 'rgba(13,95,95,0.8)' },
  ]
  return (
    <div className="my-5 space-y-3 rounded-[22px] border border-[color:var(--color-faint)] bg-white p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
        Level up the answer
      </p>
      {levels.map((lvl, i) => (
        <div key={i}
          className="flex gap-4 border-l-2 pl-4"
          style={{ borderColor: lvl.border, opacity: lvl.opacity }}>
          <span className="mt-1 w-16 flex-shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            {lvl.label}
          </span>
          <span className="text-[15px] italic leading-7 text-[color:#2d2723]" style={{ fontWeight: lvl.weight }}>
            "{lvl.text}"
          </span>
        </div>
      ))}
    </div>
  )
}
