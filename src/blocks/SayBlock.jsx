export default function SayBlock({ block }) {
  return (
    <div className="my-3 flex gap-3 rounded-[22px] border border-[color:var(--color-accent)]/30 bg-white/90 px-4 py-3">
      <span className="mt-0.5 flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">Say</span>
      <span className="text-[15px] italic leading-7 text-[color:#2d2723]">"{block.text}"</span>
    </div>
  )
}
