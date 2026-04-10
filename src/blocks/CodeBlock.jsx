import { useState } from 'react'
import { CopyIcon } from '../ui/Icons'

export default function CodeBlock({ lang, code, label, wrap = false }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600) })
  }
  return (
    <div className="code-block my-4 overflow-hidden rounded-[24px] border border-[color:#2a2622]">
      <div className="code-header">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-faint)]">{label || lang}</span>
        <button onClick={copy}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            copied ? 'bg-[color:var(--color-amber)]/20 text-[color:var(--color-faint)]' : 'bg-[color:#2a2622] text-[color:#d6ccbe] hover:bg-[color:#3a342f] hover:text-white'
          }`}>
          <CopyIcon /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={wrap ? 'wrap-code' : ''}>{code}</pre>
    </div>
  )
}
