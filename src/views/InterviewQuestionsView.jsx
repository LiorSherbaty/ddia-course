import { useState } from 'react'
import { INTERVIEW_QUESTIONS, STRONGER_ANSWERS } from '../data/course'
import { saveProgress } from '../lib/storage'
import { CheckIcon, ChevronIcon } from '../ui/Icons'
import SectionLabel from '../ui/SectionLabel'
import Card from '../ui/Card'
import PageFrame from '../layout/PageFrame'
import MetaChip from '../ui/MetaChip'
import HeroNote from '../ui/HeroNote'
import HeroStat from '../ui/HeroStat'

export default function InterviewQuestionsView({ progress, setProgress }) {
  const [practice, setPractice] = useState(null)

  const togglePracticed = (i) => {
    const key = `iq-${i}`
    setProgress(p => {
      const updated = { ...p, labItems: { ...p.labItems, [key]: !p.labItems[key] } }
      saveProgress(updated); return updated
    })
  }

  const setNote = (i, value) => {
    setProgress(p => {
      const updated = { ...p, questionNotes: { ...(p.questionNotes || {}), [i]: value } }
      saveProgress(updated); return updated
    })
  }

  const done = INTERVIEW_QUESTIONS.filter((_, i) => progress.labItems[`iq-${i}`]).length

  return (
    <PageFrame className="space-y-6">
      <div className="surface-panel hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent)]">Interview Practice</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip>{done}/{INTERVIEW_QUESTIONS.length} complete</MetaChip>
              <MetaChip>Progress tracked locally</MetaChip>
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-ink)] sm:text-5xl">25 Questions</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-muted)] sm:text-lg">
              Check off each prompt when you can answer it clearly without notes, then capture your key talking points.
            </p>
          </div>
          <div className="grid gap-3 md:max-w-3xl">
            <HeroNote label="How to use this">Open a question, answer out loud, then write the 3-5 ideas you want to hit under time pressure.</HeroNote>
            <div className="grid grid-cols-2 gap-3">
              <HeroStat label="Questions" value={INTERVIEW_QUESTIONS.length} />
              <HeroStat label="Practiced" value={done} />
            </div>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true" />
      </div>

      <Card>
        <div className="space-y-1.5">
          {INTERVIEW_QUESTIONS.map((q, i) => {
            const practiced = !!progress.labItems[`iq-${i}`]
            const open = practice === i
            return (
              <div key={i} className={`overflow-hidden rounded-[22px] border transition-colors ${open ? 'border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/70' : 'border-[color:var(--color-faint)] bg-white/80'}`}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setPractice(open ? null : i)}>
                  <div onClick={(e) => { e.stopPropagation(); togglePracticed(i) }}
                    className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded cursor-pointer transition-all ${practiced ? 'pop-in bg-[color:var(--color-accent)] text-white shadow-[0_10px_20px_rgba(13,95,95,0.18)]' : 'border-2 border-[color:var(--color-accent)]/30 bg-white hover:border-[color:var(--color-accent)]/60'}`}>
                    {practiced && <CheckIcon />}
                  </div>
                  <span className={`flex-1 text-sm leading-7 transition-colors ${practiced ? 'text-[color:#9a9386] line-through' : 'text-[color:#2d2723]'}`}>
                    <span className="mr-1.5 font-mono text-xs text-[color:var(--color-accent)]">{i + 1}.</span>{q}
                  </span>
                  <ChevronIcon open={open} />
                </div>
                {open && (
                  <div className="fade-in border-t border-[color:var(--color-faint)] px-4 pb-4 pt-2">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[color:#9a9386]">Answer out loud, then write key points</p>
                    <textarea
                      rows={3}
                      placeholder="Key points..."
                      value={(progress.questionNotes && progress.questionNotes[i]) || ''}
                      onChange={(e) => setNote(i, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <SectionLabel>10 Phrases That Sound Senior</SectionLabel>
        <div className="space-y-3">
          {STRONGER_ANSWERS.map((a, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="mt-0.5 w-6 flex-shrink-0 text-right font-mono text-xs font-semibold text-[color:var(--color-accent)]">{i + 1}</span>
              <p className="text-[15px] italic leading-7 text-[color:var(--color-muted)]">"{a}"</p>
            </div>
          ))}
        </div>
      </Card>
    </PageFrame>
  )
}
