export default function NumberedListBlock({ block }) {
  return (
    <ol className="my-3 space-y-3">
      {block.items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] text-xs font-semibold text-[color:var(--color-accent)]">{i + 1}</span>
          <span className="text-[15px] leading-7 text-[color:var(--color-muted)]">{item}</span>
        </li>
      ))}
    </ol>
  )
}
