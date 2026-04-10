export default function RedFlagBlock({ block }) {
  return (
    <div className="my-4 flex gap-3 rounded-[22px] border border-[color:#8b2e2e]/30 bg-[color:#8b2e2e]/5 px-4 py-3">
      <span className="mt-0.5 flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[color:#8b2e2e]">
        Red flag
      </span>
      <span className="text-[15px] italic leading-7 text-[color:#2d2723]">
        "{block.text}"
      </span>
    </div>
  )
}
