export default function DontBlock({ block }) {
  return (
    <div className="my-3 flex gap-3 rounded-[22px] border border-[color:var(--color-faint)] bg-[color:#f5efe3] px-4 py-3">
      <span className="mt-0.5 flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">Avoid</span>
      <span className="text-[15px] italic leading-7 text-[color:#2d2723]">"{block.text}"</span>
    </div>
  )
}
