export default function FollowUpBlock({ block }) {
  return (
    <div className="my-5 rounded-[22px] border border-[color:var(--color-faint)] bg-white p-5">
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
        Follow-up
      </p>
      <p className="mb-3 font-mono text-sm font-semibold uppercase tracking-[0.03em] text-[color:var(--color-ink)]">
        {block.question}
      </p>
      <p className="text-[15px] italic leading-7 text-[color:#2d2723]">
        "{block.answer}"
      </p>
    </div>
  )
}
