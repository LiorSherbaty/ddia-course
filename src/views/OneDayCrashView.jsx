import { useState } from 'react'
import { ONE_DAY_TOPICS, MEGA_PROMPT } from '../data/course'
import { CopyIcon } from '../ui/Icons'
import SectionLabel from '../ui/SectionLabel'
import Card from '../ui/Card'
import PageFrame from '../layout/PageFrame'
import MetaChip from '../ui/MetaChip'
import HeroNote from '../ui/HeroNote'
import HeroStat from '../ui/HeroStat'
import CodeBlock from '../blocks/CodeBlock'
import LevelUpBlock from '../blocks/LevelUpBlock'

export default function OneDayCrashView() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(MEGA_PROMPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }

  return (
    <PageFrame className="space-y-6">
      <div className="surface-panel hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent)]">Compressed Prep</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip>Crash mode</MetaChip>
              <MetaChip>{ONE_DAY_TOPICS.length} priorities</MetaChip>
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-ink)] sm:text-5xl">One Day Plan</h1>
            <p className="mt-4 max-w-2xl font-display text-xl italic leading-snug text-[color:var(--color-muted)] sm:text-2xl">
              One day. No time to panic. Read the priority topics, run the mega prompt, then speak the answer out loud — twice.
            </p>
          </div>
          <div className="grid gap-3 md:max-w-3xl">
            <HeroNote label="What to optimize for">Aim for clarity, sequencing, and trade-off language. Depth beats coverage when the clock is short.</HeroNote>
            <div className="grid grid-cols-2 gap-3">
              <HeroStat label="Prompt" value="1" />
              <HeroStat label="Topics" value={ONE_DAY_TOPICS.length} />
            </div>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true" />
      </div>

      <Card>
        <SectionLabel>Priority Topics</SectionLabel>
        <ol className="space-y-3">
          {ONE_DAY_TOPICS.map((t, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] text-xs font-semibold text-[color:var(--color-accent)]">{i + 1}</span>
              <span className="text-sm leading-7 text-[color:#2d2723]">{t}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <SectionLabel>How the answer should sound by the end</SectionLabel>
        <LevelUpBlock block={{
          weak: 'I would use a microservice and a queue.',
          strong: 'I would split read and write paths — the write path uses an outbox for reliability, the read path uses a replica for latency.',
          senior: 'The core trade-off is freshness versus availability. I bias toward async replication with an outbox for writes, because losing a write is a worse failure than reading a stale one — and I can always add a synchronous read of the primary for the cases where freshness actually matters.'
        }} />
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <SectionLabel>Mega Prompt</SectionLabel>
          <button onClick={copy}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${copied ? 'bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-deep)]' : 'border border-[color:var(--color-accent)]/30 bg-white text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)]/50 hover:text-[color:var(--color-ink)]'}`}>
            <CopyIcon /> {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
        <p className="mb-4 text-sm leading-7 text-[color:var(--color-muted)]">Paste this into Claude or ChatGPT to simulate a guided mock interview and a last-pass coaching session.</p>
        <CodeBlock lang="prompt" label="Mock Interview Prompt" code={MEGA_PROMPT} wrap />
      </Card>
    </PageFrame>
  )
}
