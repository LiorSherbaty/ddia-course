export default function CalloutBlock({ block }) {
  return (
    <div className="my-4 rounded-[22px] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)] px-4 py-3">
      <p className="font-mono text-sm leading-7 text-[color:var(--color-accent-deep)] whitespace-pre-line">{block.text}</p>
    </div>
  )
}
