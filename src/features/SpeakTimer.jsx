import { useState, useEffect, useRef } from 'react'

export default function SpeakTimer({ minutes }) {
  const total = minutes * 60
  const [secs, setSecs] = useState(total)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSecs(s => {
        if (s <= 1) { clearInterval(ref.current); setRunning(false); return 0 }
        return s - 1
      }), 1000)
    } else clearInterval(ref.current)
    return () => clearInterval(ref.current)
  }, [running])

  const reset = () => { setRunning(false); setSecs(total) }
  const pct = total === 0 ? 0 : secs / total
  const r = 33, circ = 2 * Math.PI * r
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  const done = secs === 0

  return (
    <div className="rounded-[26px] border border-[color:var(--color-faint)] bg-[color:var(--color-accent-soft)]/60 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 flex-shrink-0">
          <svg width="80" height="80">
            <circle cx="40" cy="40" r={r} fill="none" stroke="#e8e1d4" strokeWidth="4" />
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke="#0d5f5f"
              strokeWidth="4"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              className="timer-ring"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold text-[color:var(--color-accent-deep)]">
            {m}:{s}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-sm font-semibold text-[color:var(--color-ink)]">{minutes}-minute drill</p>
          <p className="mb-4 text-sm leading-6 text-[color:var(--color-muted)]">
            Say the answer cleanly enough that it sounds interview-ready without reading.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setRunning(r => !r)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                running
                  ? 'border border-[color:var(--color-accent)]/30 bg-white text-[color:var(--color-accent-deep)] hover:border-[color:var(--color-accent)]/50 hover:bg-[color:var(--color-accent-soft)]'
                  : done
                    ? 'border border-[color:var(--color-accent)]/30 bg-white text-[color:var(--color-accent-deep)] hover:border-[color:var(--color-accent)]/50 hover:bg-[color:var(--color-accent-soft)]'
                    : 'bg-[color:var(--color-accent)] text-white shadow-[0_10px_24px_rgba(13,95,95,0.22)] hover:bg-[color:var(--color-accent-deep)]'
              }`}>
              {done ? 'Done' : running ? 'Pause' : secs === total ? 'Start' : 'Resume'}
            </button>
            <button onClick={reset}
              className="rounded-full border border-[color:var(--color-accent)]/30 bg-white px-4 py-2 text-xs font-semibold text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-accent)]/50 hover:text-[color:var(--color-ink)]">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
