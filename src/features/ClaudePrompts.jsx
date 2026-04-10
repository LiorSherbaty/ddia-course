import { useState } from 'react'
import { CopyIcon } from '../ui/Icons'

export default function ClaudePrompts({ prompts }) {
  const [copied, setCopied] = useState(null)
  const copy = (text, i) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(i); setTimeout(() => setCopied(null), 1500) })
  }
  return (
    <div className="space-y-3">
      {prompts.map((p, i) => (
        <div key={i} className="rounded-[24px] border border-[color:var(--color-faint)] bg-white/80 p-4">
          <p className="mb-4 font-mono text-sm leading-7 text-[color:var(--color-muted)]">{p}</p>
          <button onClick={() => copy(p, i)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${copied === i ? 'bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-deep)]' : 'border border-[color:var(--color-accent)]/30 bg-white text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)]/50 hover:text-[color:var(--color-ink)]'}`}>
            <CopyIcon /> {copied === i ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
      ))}
    </div>
  )
}
