import { getDayAccent } from '../lib/theme'

export default function EchoBlock({ block }) {
  const accent = getDayAccent(block.refDay)
  return (
    <div className="my-4 border-l-2 pl-4 py-1" style={{ borderColor: accent.base }}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent.base }}>
        See Day {block.refDay}{block.refSection ? `.${block.refSection}` : ''}
      </p>
      <p className="mt-1 text-[14px] leading-6 text-[color:var(--color-muted)]">
        {block.text}
      </p>
    </div>
  )
}
