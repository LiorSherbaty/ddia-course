import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DAYS, MEMORY_MAP, INTERVIEW_QUESTIONS, STRONGER_ANSWERS,
  ONE_DAY_TOPICS, MEGA_PROMPT
} from './data/course'
import { LAB_GUIDES } from './data/labGuides'

// ─── localStorage ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'ddia_progress_v1'
const defaultProgress = () => ({
  completedDays: [],
  labItems: {},
  quizAnswers: {},
  currentView: 'day-1',
  notes: {},
})

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultProgress(), ...JSON.parse(raw) } : defaultProgress()
  } catch { return defaultProgress() }
}

function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

// ─── Icons ──────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const ChevronIcon = ({ open }) => (
  <svg className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180 text-sky-700' : 'text-slate-400'}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// ─── SpeakTimer ─────────────────────────────────────────────────────────────
function SpeakTimer({ minutes }) {
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
    <div className="rounded-[26px] border border-sky-100 bg-sky-50/65 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 flex-shrink-0">
          <svg width="80" height="80">
            <circle cx="40" cy="40" r={r} fill="none" stroke="#dbeafe" strokeWidth="4" />
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              className="timer-ring"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold text-sky-800">
            {m}:{s}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-sm font-semibold text-slate-800">{minutes}-minute drill</p>
          <p className="mb-4 text-sm leading-6 text-slate-500">
            Say the answer cleanly enough that it sounds interview-ready without reading.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setRunning(r => !r)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                running
                  ? 'border border-sky-200 bg-white text-sky-800 hover:border-sky-300 hover:bg-sky-50'
                  : done
                    ? 'border border-sky-200 bg-white text-sky-800 hover:border-sky-300 hover:bg-sky-50'
                    : 'bg-sky-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] hover:bg-sky-700'
              }`}>
              {done ? 'Done' : running ? 'Pause' : secs === total ? 'Start' : 'Resume'}
            </button>
            <button onClick={reset}
              className="rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-sky-300 hover:text-slate-900">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CodeBlock ───────────────────────────────────────────────────────────────
function CodeBlock({ lang, code, label, wrap = false }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600) })
  }
  return (
    <div className="code-block my-4 overflow-hidden rounded-[24px] border border-slate-800/70">
      <div className="code-header">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/80">{label || lang}</span>
        <button onClick={copy}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            copied ? 'bg-sky-500/20 text-sky-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}>
          <CopyIcon /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={wrap ? 'wrap-code' : ''}>{code}</pre>
    </div>
  )
}

// ─── ContentBlock ────────────────────────────────────────────────────────────
function ContentBlock({ block }) {
  switch (block.type) {
    case 'text':
      return <p className="mb-3 text-[15px] leading-7 text-slate-600">{block.text}</p>
    case 'subheading':
      return <h4 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">{block.text}</h4>
    case 'interview-quote':
      return (
        <div className="my-4 rounded-[24px] border border-sky-200 bg-sky-50/80 px-5 py-4">
          <p className="text-[15px] italic leading-7 text-sky-900 whitespace-pre-line">{block.text}</p>
        </div>
      )
    case 'say':
      return (
        <div className="my-3 flex gap-3 rounded-[22px] border border-sky-200 bg-white/90 px-4 py-3">
          <span className="mt-0.5 flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">Say</span>
          <span className="text-[15px] italic leading-7 text-slate-700">"{block.text}"</span>
        </div>
      )
    case 'dont':
      return (
        <div className="my-3 flex gap-3 rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3">
          <span className="mt-0.5 flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Avoid</span>
          <span className="text-[15px] italic leading-7 text-slate-700">"{block.text}"</span>
        </div>
      )
    case 'callout':
      return (
        <div className="my-4 rounded-[22px] border border-sky-200 bg-sky-100/75 px-4 py-3">
          <p className="font-mono text-sm leading-7 text-sky-900 whitespace-pre-line">{block.text}</p>
        </div>
      )
    case 'radwork':
      return (
        <div className="my-4 rounded-[22px] border border-sky-100 bg-white/85 px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">RadWork Transfer</p>
          <p className="text-[15px] leading-7 text-slate-600">{block.text}</p>
        </div>
      )
    case 'list':
      return (
        <ul className="my-3 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />
              <span className="text-[15px] leading-7 text-slate-600">{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'numbered-list':
      return (
        <ol className="my-3 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{i + 1}</span>
              <span className="text-[15px] leading-7 text-slate-600">{item}</span>
            </li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="my-4 overflow-x-auto rounded-[24px] border border-sky-100 bg-white/80">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-50/90">
                {block.headers.map((h, i) => (
                  <th key={i} className="border-b border-sky-100 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white/80' : 'bg-sky-50/40'}>
                  {row.map((cell, j) => (
                    <td key={j} className="border-b border-sky-50 px-4 py-3 align-top text-[15px] leading-7 text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} label={block.label} />
    default:
      return null
  }
}

// ─── QuizSection ─────────────────────────────────────────────────────────────
function QuizSection({ quiz, dayId, progress, setProgress }) {
  const toggle = (i) => {
    const key = `${dayId}-${i}`
    setProgress(p => {
      const updated = { ...p, quizAnswers: { ...p.quizAnswers, [key]: !p.quizAnswers[key] } }
      saveProgress(updated); return updated
    })
  }
  return (
    <div className="space-y-2.5">
      {quiz.map((item, i) => {
        const open = !!progress.quizAnswers[`${dayId}-${i}`]
        return (
          <div key={i} className={`overflow-hidden rounded-[22px] border transition-colors ${open ? 'border-sky-200 bg-sky-50/80' : 'border-sky-100 bg-white/80'}`}>
            <button onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">
              <span className="pr-4 text-sm leading-6 text-slate-700">
                <span className="mr-2 font-mono text-xs text-sky-600">Q{i + 1}</span>
                {item.q}
              </span>
              <ChevronIcon open={open} />
            </button>
            {open && (
              <div className="fade-in border-t border-sky-100 px-4 py-3">
                <p className="text-sm leading-7 text-slate-600">{item.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── LabChecklist ────────────────────────────────────────────────────────────
function LabChecklist({ lab, dayId, progress, setProgress }) {
  const toggle = (i) => {
    const key = `${dayId}-${i}`
    setProgress(p => {
      const updated = { ...p, labItems: { ...p.labItems, [key]: !p.labItems[key] } }
      saveProgress(updated); return updated
    })
  }
  const done = lab.filter((_, i) => progress.labItems[`${dayId}-${i}`]).length

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-slate-500">{done}/{lab.length} complete</p>
      <div className="space-y-3">
        {lab.map((item, i) => {
          const checked = !!progress.labItems[`${dayId}-${i}`]
          return (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <div onClick={() => toggle(i)} className={`mt-0.5 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded transition-all ${checked ? 'pop-in bg-sky-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]' : 'border-2 border-sky-200 bg-white group-hover:border-sky-400'}`}>
                {checked && <CheckIcon />}
              </div>
              <span className={`text-sm leading-7 transition-colors ${checked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{item}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ─── LabGuide ───────────────────────────────────────────────────────────────
function LabGuide({ dayId }) {
  const guide = LAB_GUIDES[dayId]
  const [openTask, setOpenTask] = useState(null)

  if (!guide) return null

  return (
    <div className="mt-6 border-t border-sky-100 pt-6">
      <SectionLabel>Step-by-Step Guide</SectionLabel>
      <div className="space-y-2.5">
        {guide.map((item, ti) => {
          const isOpen = openTask === ti
          return (
            <div key={ti} className="overflow-hidden rounded-[22px] border border-sky-100 bg-white/70">
              <button
                onClick={() => setOpenTask(isOpen ? null : ti)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sky-50/70"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{ti + 1}</span>
                <span className="flex-1 text-sm font-medium text-slate-700">{item.task}</span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="fade-in border-t border-sky-100 bg-sky-50/35 px-4 pb-4 pt-2">
                  {item.steps.map((step, si) => (
                    <div key={si} className="mt-4 first:mt-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-white px-2 py-1 font-mono text-[11px] font-semibold text-sky-700">{ti + 1}.{si + 1}</span>
                        <h5 className="text-sm font-semibold text-slate-800">{step.title}</h5>
                      </div>
                      {step.text && <p className="mb-2 text-sm leading-7 text-slate-600 whitespace-pre-line">{step.text}</p>}
                      {step.code && <CodeBlock lang={step.lang || 'text'} code={step.code} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ClaudePrompts ───────────────────────────────────────────────────────────
function ClaudePrompts({ prompts }) {
  const [copied, setCopied] = useState(null)
  const copy = (text, i) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(i); setTimeout(() => setCopied(null), 1500) })
  }
  return (
    <div className="space-y-3">
      {prompts.map((p, i) => (
        <div key={i} className="rounded-[24px] border border-sky-100 bg-white/80 p-4">
          <p className="mb-4 font-mono text-sm leading-7 text-slate-600">{p}</p>
          <button onClick={() => copy(p, i)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${copied === i ? 'bg-sky-100 text-sky-800' : 'border border-sky-200 bg-white text-slate-600 hover:border-sky-300 hover:text-slate-900'}`}>
            <CopyIcon /> {copied === i ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── NotesSection ────────────────────────────────────────────────────────────
function NotesSection({ dayId, progress, setProgress }) {
  const val = progress.notes[dayId] || ''
  const onChange = (e) => {
    setProgress(p => {
      const updated = { ...p, notes: { ...p.notes, [dayId]: e.target.value } }
      saveProgress(updated); return updated
    })
  }
  const TEMPLATE = `Day: ${dayId}\nTopic:\n\nWhat problem is this topic solving?\n\nWhat are the 3 most important trade-offs?\n\nWhat would I say in an interview?\n\nWhat would I build in .NET?\n\nWhat can go wrong?\n\nWhat is still unclear to me?`

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">Auto-saved locally</span>
        {!val && (
          <button onClick={() => onChange({ target: { value: TEMPLATE } })}
            className="text-xs font-semibold text-sky-700 transition-colors hover:text-sky-900">
            Use template
          </button>
        )}
      </div>
      <textarea value={val} onChange={onChange} rows={10} placeholder="Write your notes here..." />
    </div>
  )
}

// ─── Section label ───────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">{children}</h3>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`surface-panel rounded-[28px] p-5 sm:p-6 lg:p-7 ${className}`}>
      {children}
    </div>
  )
}

function PageFrame({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 ${className}`}>
      {children}
    </div>
  )
}

function MetaChip({ children }) {
  return (
    <span className="rounded-full border border-sky-200/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800">
      {children}
    </span>
  )
}

function HeroNote({ label, children }) {
  return (
    <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-[0_14px_30px_rgba(148,163,184,0.08)]">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">{label}</p>
      <p className="text-sm leading-6 text-slate-600">{children}</p>
    </div>
  )
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-[22px] border border-sky-100/80 bg-white/74 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  )
}

// ─── DayView ─────────────────────────────────────────────────────────────────
function DayView({ day, progress, setProgress }) {
  const isComplete = progress.completedDays.includes(day.id)
  const markComplete = () => {
    setProgress(p => {
      const cd = isComplete ? p.completedDays.filter(d => d !== day.id) : [...p.completedDays, day.id]
      const updated = { ...p, completedDays: cd }
      saveProgress(updated); return updated
    })
  }

  return (
    <PageFrame className="space-y-6">
      <div className="surface-panel hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Day {day.id} of {DAYS.length}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip>{day.chapters}</MetaChip>
              <MetaChip>{day.duration}</MetaChip>
              <MetaChip>{day.sections.length} sections</MetaChip>
            </div>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-slate-900 sm:text-5xl">
              {day.shortTitle} <span className="font-body text-sky-500">/</span> {day.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{day.theme}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={markComplete}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${isComplete ? 'bg-sky-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] hover:bg-sky-700' : 'border border-sky-200 bg-white text-slate-700 hover:border-sky-300 hover:text-slate-900'}`}>
                {isComplete && <CheckIcon />}
                {isComplete ? 'Completed' : 'Mark day complete'}
              </button>
              <span className="text-sm text-slate-500">All notes, quiz opens, and lab progress save locally.</span>
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
            <div className="mb-5 flex flex-col gap-3 border-b border-sky-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 font-mono text-xs font-semibold text-sky-700">{sec.id}</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{sec.title}</h2>
              </div>
            </div>
            {sec.blocks.map((block, i) => <ContentBlock key={i} block={block} />)}
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
              <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />
              <span className="text-sm leading-7 text-slate-600">{t}</span>
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
    </PageFrame>
  )
}

// ─── MemoryMapView ───────────────────────────────────────────────────────────
function MemoryMapView() {
  return (
    <PageFrame className="space-y-6">
      <div className="surface-panel hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Fast Recall</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip>{MEMORY_MAP.length} cues</MetaChip>
              <MetaChip>{DAYS.length} study days</MetaChip>
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-slate-900 sm:text-5xl">Memory Map</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
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
        <div className="divide-y divide-sky-100">
          {MEMORY_MAP.map((item, i) => (
            <div key={i} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:gap-8">
              <span className="w-full flex-shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 sm:w-40">{item.term}</span>
              <span className="text-[15px] leading-7 text-slate-600">{item.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageFrame>
  )
}

// ─── InterviewQuestionsView ──────────────────────────────────────────────────
function InterviewQuestionsView({ progress, setProgress }) {
  const [practice, setPractice] = useState(null)

  const togglePracticed = (i) => {
    const key = `iq-${i}`
    setProgress(p => {
      const updated = { ...p, labItems: { ...p.labItems, [key]: !p.labItems[key] } }
      saveProgress(updated); return updated
    })
  }

  const done = INTERVIEW_QUESTIONS.filter((_, i) => progress.labItems[`iq-${i}`]).length

  return (
    <PageFrame className="space-y-6">
      <div className="surface-panel hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Interview Practice</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip>{done}/{INTERVIEW_QUESTIONS.length} complete</MetaChip>
              <MetaChip>Progress tracked locally</MetaChip>
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-slate-900 sm:text-5xl">25 Questions</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
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
              <div key={i} className={`overflow-hidden rounded-[22px] border transition-colors ${open ? 'border-sky-200 bg-sky-50/80' : 'border-sky-100 bg-white/80'}`}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setPractice(open ? null : i)}>
                  <div onClick={(e) => { e.stopPropagation(); togglePracticed(i) }}
                    className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded cursor-pointer transition-all ${practiced ? 'pop-in bg-sky-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)]' : 'border-2 border-sky-200 bg-white hover:border-sky-400'}`}>
                    {practiced && <CheckIcon />}
                  </div>
                  <span className={`flex-1 text-sm leading-7 transition-colors ${practiced ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    <span className="mr-1.5 font-mono text-xs text-sky-600">{i + 1}.</span>{q}
                  </span>
                  <ChevronIcon open={open} />
                </div>
                {open && (
                  <div className="fade-in border-t border-sky-100 px-4 pb-4 pt-2">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Answer out loud, then write key points</p>
                    <textarea rows={3} placeholder="Key points..." className="text-sm" />
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
              <span className="mt-0.5 w-6 flex-shrink-0 text-right font-mono text-xs font-semibold text-sky-600">{i + 1}</span>
              <p className="text-[15px] italic leading-7 text-slate-600">"{a}"</p>
            </div>
          ))}
        </div>
      </Card>
    </PageFrame>
  )
}

// ─── OneDayCrashView ─────────────────────────────────────────────────────────
function OneDayCrashView() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(MEGA_PROMPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }

  return (
    <PageFrame className="space-y-6">
      <div className="surface-panel hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Compressed Prep</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip>Crash mode</MetaChip>
              <MetaChip>{ONE_DAY_TOPICS.length} priorities</MetaChip>
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-slate-900 sm:text-5xl">One Day Plan</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              If time collapses to a single day, this view keeps the sequence focused instead of trying to reread everything.
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
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{i + 1}</span>
              <span className="text-sm leading-7 text-slate-700">{t}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <SectionLabel>Mega Prompt</SectionLabel>
          <button onClick={copy}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${copied ? 'bg-sky-100 text-sky-800' : 'border border-sky-200 bg-white text-slate-600 hover:border-sky-300 hover:text-slate-900'}`}>
            <CopyIcon /> {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
        <p className="mb-4 text-sm leading-7 text-slate-500">Paste this into Claude or ChatGPT to simulate a guided mock interview and a last-pass coaching session.</p>
        <CodeBlock lang="prompt" label="Mock Interview Prompt" code={MEGA_PROMPT} wrap />
      </Card>
    </PageFrame>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ currentView, setView, progress, mobileOpen, setMobileOpen }) {
  const completedCount = progress.completedDays.length
  const pct = Math.round((completedCount / DAYS.length) * 100)

  const navDays = DAYS.map(d => ({ id: `day-${d.id}`, label: d.shortTitle, sub: d.theme, num: d.id }))
  const navBonus = [
    { id: 'memory-map', label: 'Memory Map', sub: 'Quick reference' },
    { id: 'interview-qs', label: '25 Questions', sub: 'Practice & track' },
    { id: 'crash', label: 'One Day Plan', sub: 'Last-minute prep' },
  ]

  const handleNav = (id) => {
    setView(id)
    setMobileOpen(false)
  }

  const NavBtn = ({ item, isBonus }) => {
    const active = currentView === item.id
    const done = !isBonus && progress.completedDays.includes(item.num)
    return (
      <button onClick={() => handleNav(item.id)}
        className={`group flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition-all ${active ? 'border-sky-600 bg-sky-600 text-white shadow-[0_16px_36px_rgba(37,99,235,0.24)]' : 'border-transparent bg-transparent text-slate-600 hover:border-sky-100 hover:bg-white/82 hover:text-slate-900'}`}>
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${active ? 'bg-white/18 text-white' : done ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700'}`}>
          {done ? '✓' : isBonus ? '·' : item.num}
        </div>
        <div className="min-w-0">
          <p className={`truncate text-sm font-medium ${active ? 'text-white' : ''}`}>{item.label}</p>
          <p className={`text-xs ${active ? 'text-sky-100/80' : 'text-slate-400'}`}>{item.sub}</p>
        </div>
      </button>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5">
        <div className="surface-panel rounded-[28px] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Study Companion</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-slate-900">DDIA</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A focused system design prep course for mid-level .NET engineers.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Progress</span>
              <span className="font-mono text-sky-700">{completedCount}/{DAYS.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-sky-100 bg-sky-50">
              <div className="progress-fill h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{pct}% complete</span>
              <span>Auto-saved</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-5">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">7 Day Plan</p>
          <div className="mt-2 space-y-1.5">
            {navDays.map(item => <NavBtn key={item.id} item={item} isBonus={false} />)}
          </div>
        </div>

        <div className="mt-5 border-t border-sky-100 pt-5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Bonus Views</p>
          <div className="mt-2 space-y-1.5">
            {navBonus.map(item => <NavBtn key={item.id} item={item} isBonus={true} />)}
          </div>
        </div>
      </nav>

      <div className="px-4 pb-4 pt-2">
        <button onClick={() => {
          if (confirm('Reset all progress? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY); window.location.reload()
          }
        }} className="w-full rounded-full border border-sky-100 bg-white/72 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 transition-colors hover:border-sky-200 hover:text-slate-800">
          Reset Progress
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[19rem] flex-shrink-0 border-r border-white/70 bg-white/55 backdrop-blur-xl lg:flex xl:w-[20.5rem]">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <>
          <div className="sidebar-overlay lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-[22rem] flex-col border-r border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-xl lg:hidden">
            <div className="px-4 pt-4">
              <button onClick={() => setMobileOpen(false)} className="ml-auto flex rounded-full border border-sky-100 bg-white/80 p-2 text-slate-600">
                <CloseIcon />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentView = progress.currentView || 'day-1'

  const mainRef = useRef(null)

  const setView = useCallback((view) => {
    setProgress(p => {
      const updated = { ...p, currentView: view }
      saveProgress(updated); return updated
    })
    if (mainRef.current) mainRef.current.scrollTop = 0
    window.scrollTo(0, 0)
  }, [])

  const renderView = () => {
    if (currentView.startsWith('day-')) {
      const day = DAYS.find(d => d.id === parseInt(currentView.replace('day-', '')))
      if (day) return <DayView day={day} progress={progress} setProgress={setProgress} />
    }
    if (currentView === 'memory-map') return <MemoryMapView />
    if (currentView === 'interview-qs') return <InterviewQuestionsView progress={progress} setProgress={setProgress} />
    if (currentView === 'crash') return <OneDayCrashView />
    return null
  }

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar currentView={currentView} setView={setView} progress={progress}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/70 bg-white/70 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-full border border-sky-100 bg-white/80 p-2 text-slate-600 transition-colors hover:border-sky-200 hover:text-slate-900">
            <MenuIcon />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">DDIA Course</p>
            <h1 className="text-sm font-semibold text-slate-800">System Design Interview Prep</h1>
          </div>
        </header>

        <main ref={mainRef} className="content-scroll flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
