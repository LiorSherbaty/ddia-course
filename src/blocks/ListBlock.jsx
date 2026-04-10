export default function ListBlock({ block }) {
  return (
    <ul className="my-3 space-y-2.5">
      {block.items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[color:var(--color-amber)]" />
          <span className="text-[15px] leading-7 text-[color:var(--color-muted)]">{item}</span>
        </li>
      ))}
    </ul>
  )
}
