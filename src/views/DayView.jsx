import { DAYS } from '../data/course'
import { saveProgress } from '../lib/storage'
import { getDayAccent } from '../lib/theme'
import { CheckIcon } from '../ui/Icons'
import SectionLabel from '../ui/SectionLabel'
import Card from '../ui/Card'
import PageFrame from '../layout/PageFrame'
import MetaChip from '../ui/MetaChip'
import HeroNote from '../ui/HeroNote'
import HeroStat from '../ui/HeroStat'
import SpeakTimer from '../features/SpeakTimer'
import ContentBlock from '../blocks/ContentBlock'
import QuizSection from '../features/QuizSection'
import LabChecklist from '../features/LabChecklist'
import LabGuide from '../features/LabGuide'
import ClaudePrompts from '../features/ClaudePrompts'
import NotesSection from '../features/NotesSection'

export default function DayView({ day, progress, setProgress }) {
  const isComplete = progress.completedDays.includes(day.id)
  const accent = getDayAccent(day.id)
  const markComplete = () => {
    setProgress(p => {
      const cd = isComplete ? p.completedDays.filter(d => d !== day.id) : [...p.completedDays, day.id]
      const updated = { ...p, completedDays: cd }
      saveProgress(updated); return updated
    })
  }

  const dayStyle = {
    '--day-accent': accent.base,
    '--day-accent-soft': accent.soft,
  }

  return (
    <PageFrame className="space-y-6" style={dayStyle}>
      <div className="surface-panel hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="hero-numeral" aria-hidden="true">{day.id}</div>
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--day-accent)' }}>
              Day {day.id} of {DAYS.length} · {accent.label}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip>{day.chapters}</MetaChip>
              <MetaChip>{day.duration}</MetaChip>
              <MetaChip>{day.sections.length} sections</MetaChip>
            </div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-ink)] sm:text-5xl lg:text-6xl">
              {day.shortTitle} <span className="font-display italic" style={{ color: 'var(--day-accent)' }}>/</span> {day.title}
            </h1>
            <p className="mt-4 max-w-2xl font-display text-lg italic leading-8 text-[color:var(--color-muted)] sm:text-xl">{day.theme}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={markComplete}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all"
                style={isComplete
                  ? { background: 'var(--day-accent)', color: 'white', boxShadow: '0 14px 30px rgba(0,0,0,0.12)' }
                  : { border: '1px solid var(--day-accent)', background: 'white', color: 'var(--day-accent)' }}>
                {isComplete && <CheckIcon />}
                {isComplete ? 'Completed' : 'Mark day complete'}
              </button>
              <span className="text-sm text-[color:var(--color-muted)]">All notes, quiz opens, and lab progress save locally.</span>
            </div>
          </div>

          <div className="grid gap-3 md:max-w-3xl">
            <HeroNote label="What interviewers test">{day.interviewerTesting}</HeroNote>
            <HeroNote label="Target outcome">{day.outcome}</HeroNote>
            <div className="grid grid-cols-3 gap-3">
              <HeroStat label="Lab" value={day.lab.length} />
              <HeroStat label="Quiz" value={day.quiz.length} />
              <HeroStat label="Drill" value={`${day.speakDrill.minutes}m`} />
            </div>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true" />
      </div>

      <div className="space-y-4">
        {day.sections.map(sec => (
          <Card key={sec.id}>
            <div className="mb-5 flex flex-col gap-3 border-b border-[color:var(--color-faint)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full px-3 py-1 font-mono text-xs font-semibold"
                  style={{ background: 'var(--day-accent-soft)', color: 'var(--day-accent)' }}>
                  {sec.id}
                </span>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-3xl">{sec.title}</h2>
              </div>
            </div>
            {sec.blocks.map((block, i) => <ContentBlock key={i} block={block} dayId={day.id} />)}
          </Card>
        ))}
      </div>

      <Card>
        <SectionLabel>Mini Lab</SectionLabel>
        <LabChecklist lab={day.lab} dayId={day.id} progress={progress} setProgress={setProgress} />
        <LabGuide key={day.id} dayId={day.id} />
      </Card>

      <Card>
        <SectionLabel>Speak It Out Loud</SectionLabel>
        <ul className="mb-5 space-y-2.5">
          {day.speakDrill.topics.map((t, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: 'var(--day-accent)' }} />
              <span className="text-sm leading-7 text-[color:var(--color-muted)]">{t}</span>
            </li>
          ))}
        </ul>
        <SpeakTimer minutes={day.speakDrill.minutes} />
      </Card>

      <Card>
        <SectionLabel>Quiz</SectionLabel>
        <QuizSection quiz={day.quiz} dayId={day.id} progress={progress} setProgress={setProgress} />
      </Card>

      <Card>
        <SectionLabel>Claude Prompts</SectionLabel>
        <ClaudePrompts prompts={day.claudePrompts} />
      </Card>

      <Card>
        <SectionLabel>Personal Notes</SectionLabel>
        <NotesSection dayId={String(day.id)} progress={progress} setProgress={setProgress} />
      </Card>

      <div className="end-mark" aria-hidden="true">
        <span>End of Day {day.id}</span>
      </div>
    </PageFrame>
  )
}
