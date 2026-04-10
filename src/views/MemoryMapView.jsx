import { DAYS, MEMORY_MAP } from '../data/course'
import Card from '../ui/Card'
import PageFrame from '../layout/PageFrame'
import MetaChip from '../ui/MetaChip'
import HeroNote from '../ui/HeroNote'
import HeroStat from '../ui/HeroStat'
import { getDayAccent } from '../lib/theme'

export default function MemoryMapView() {
  return (
    <PageFrame className="space-y-6">
      <div className="surface-panel hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent)]">Fast Recall</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip>{MEMORY_MAP.length} cues</MetaChip>
              <MetaChip>{DAYS.length} study days</MetaChip>
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-ink)] sm:text-5xl">Memory Map</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-muted)] sm:text-lg">
              The whole course compressed into a quick pass you can scan before an interview or between drills.
            </p>
          </div>
          <div className="grid gap-3 md:max-w-3xl">
            <HeroNote label="Best use">Read this first when you want vocabulary, trade-offs, and core mental models back in working memory fast.</HeroNote>
            <div className="grid grid-cols-2 gap-3">
              <HeroStat label="Terms" value={MEMORY_MAP.length} />
              <HeroStat label="Format" value="1 page" />
            </div>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true" />
      </div>

      <Card>
        <div className="space-y-8">
          {DAYS.map(day => {
            const terms = MEMORY_MAP.filter(t => t.day === day.id)
            if (terms.length === 0) return null
            const accent = getDayAccent(day.id)
            return (
              <div key={day.id}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: accent.base }} />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent.base }}>
                    Day {day.id} · {day.shortTitle}
                  </span>
                </div>
                <div className="divide-y divide-[color:var(--color-faint)]">
                  {terms.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:gap-8">
                      <span className="w-full flex-shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] sm:w-40"
                        style={{ color: accent.base }}>
                        {item.term}
                      </span>
                      <span className="text-[15px] leading-7 text-[color:var(--color-muted)]">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </PageFrame>
  )
}
