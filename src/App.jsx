import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DAYS, MEMORY_MAP, INTERVIEW_QUESTIONS, STRONGER_ANSWERS,
  ONE_DAY_TOPICS, MEGA_PROMPT
} from './data/course'

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
  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
  const pct = secs / total
  const r = 28, circ = 2 * Math.PI * r
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  const done = secs === 0

  return (
    <div className="flex items-center gap-5 bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg width="64" height="64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="32" cy="32" r={r} fill="none"
            stroke={done ? '#059669' : '#0d9488'} strokeWidth="3"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            className="timer-ring" strokeLinecap="round" />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold ${done ? 'text-emerald-600' : 'text-teal-600'}`}>
          {m}:{s}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 mb-0.5">{minutes}-minute drill</p>
        <p className="text-xs text-gray-400 mb-3">If you can't say it clearly, you don't know it yet.</p>
        <div className="flex gap-2">
          <button onClick={() => setRunning(r => !r)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold text-white transition-colors ${running ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'}`}>
            {done ? 'Done' : running ? 'Pause' : secs === total ? 'Start' : 'Resume'}
          </button>
          <button onClick={reset}
            className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CodeBlock ───────────────────────────────────────────────────────────────
function CodeBlock({ lang, code, label }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600) })
  }
  return (
    <div className="code-block my-3 rounded-lg overflow-hidden border border-slate-600/30">
      <div className="code-header">
        <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">{label || lang}</span>
        <button onClick={copy}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors font-medium ${copied ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-600/40 text-slate-400 hover:text-slate-300'}`}>
          <CopyIcon /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>{code}</pre>
    </div>
  )
}

// ─── ContentBlock ────────────────────────────────────────────────────────────
function ContentBlock({ block }) {
  switch (block.type) {
    case 'text':
      return <p className="text-sm text-gray-600 leading-relaxed mb-2.5">{block.text}</p>
    case 'subheading':
      return <h4 className="text-sm font-semibold text-gray-800 mt-5 mb-2">{block.text}</h4>
    case 'interview-quote':
      return (
        <div className="border-l-2 border-teal-500 bg-teal-50/50 rounded-r-lg pl-4 pr-4 py-3 my-3">
          <p className="text-sm text-teal-800 italic leading-relaxed whitespace-pre-line">{block.text}</p>
        </div>
      )
    case 'say':
      return (
        <div className="flex gap-3 bg-emerald-50 border border-emerald-200/60 rounded-lg px-4 py-3 my-2.5">
          <span className="text-xs font-bold text-emerald-600 flex-shrink-0 mt-0.5">SAY</span>
          <span className="text-sm text-emerald-700 italic leading-relaxed">"{block.text}"</span>
        </div>
      )
    case 'dont':
      return (
        <div className="flex gap-3 bg-red-50 border border-red-200/60 rounded-lg px-4 py-3 my-2.5">
          <span className="text-xs font-bold text-red-500 flex-shrink-0 mt-0.5">AVOID</span>
          <span className="text-sm text-red-700 italic leading-relaxed">"{block.text}"</span>
        </div>
      )
    case 'callout':
      return (
        <div className="bg-amber-50 border border-amber-200/60 rounded-lg px-4 py-3 my-2.5">
          <p className="text-sm font-mono text-amber-800 leading-relaxed whitespace-pre-line">{block.text}</p>
        </div>
      )
    case 'radwork':
      return (
        <div className="bg-violet-50 border border-violet-200/60 rounded-lg px-4 py-3 my-2.5">
          <p className="text-xs font-semibold text-violet-500 tracking-wide uppercase mb-1">RadWork Transfer</p>
          <p className="text-sm text-violet-700 leading-relaxed">{block.text}</p>
        </div>
      )
    case 'list':
      return (
        <ul className="my-2 space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
              <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'numbered-list':
      return (
        <ol className="my-2 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="my-3 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 text-gray-600 border-b border-gray-100 align-top">{cell}</td>
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
    <div className="space-y-2">
      {quiz.map((item, i) => {
        const open = !!progress.quizAnswers[`${dayId}-${i}`]
        return (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => toggle(i)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${open ? 'bg-gray-50' : 'bg-white hover:bg-gray-50/50'}`}>
              <span className="text-sm text-gray-700 pr-4">
                <span className="text-gray-400 font-mono text-xs mr-2">Q{i + 1}</span>
                {item.q}
              </span>
              <ChevronIcon open={open} />
            </button>
            {open && (
              <div className="fade-in px-4 py-3 bg-emerald-50/50 border-t border-emerald-100">
                <p className="text-sm text-emerald-700 leading-relaxed">{item.a}</p>
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
      <p className="text-xs text-gray-400 mb-3">{done}/{lab.length} complete</p>
      <div className="space-y-2.5">
        {lab.map((item, i) => {
          const checked = !!progress.labItems[`${dayId}-${i}`]
          return (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <div onClick={() => toggle(i)} className={`w-[18px] h-[18px] rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer ${checked ? 'bg-teal-600 pop-in' : 'border-2 border-gray-300 group-hover:border-teal-400'}`}>
                {checked && <CheckIcon />}
              </div>
              <span className={`text-sm leading-relaxed transition-colors ${checked ? 'text-gray-400 line-through' : 'text-gray-600'}`}>{item}</span>
            </label>
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
        <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600 font-mono leading-relaxed mb-3">{p}</p>
          <button onClick={() => copy(p, i)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${copied === i ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-50'}`}>
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
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400">Auto-saved locally</span>
        {!val && (
          <button onClick={() => onChange({ target: { value: TEMPLATE } })}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium">
            Use template
          </button>
        )}
      </div>
      <textarea value={val} onChange={onChange} rows={8} placeholder="Write your notes here..." />
    </div>
  )
}

// ─── Section label ───────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">{children}</h3>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 p-5 sm:p-6 mb-4 ${className}`}>
      {children}
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{day.chapters}</span>
          <span className="text-xs text-gray-400">{day.duration}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-gray-900 mb-1 leading-tight">{day.shortTitle} <span className="text-gray-300 font-body font-light">/</span> {day.title}</h1>
            <p className="text-sm text-gray-400 mt-1">{day.theme}</p>
          </div>
          <button onClick={markComplete}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isComplete ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {isComplete && <CheckIcon />}
            {isComplete ? 'Done' : 'Mark done'}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <div className="bg-amber-50/60 border border-amber-200/50 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">What interviewers test</p>
            <p className="text-sm text-amber-800 leading-relaxed">{day.interviewerTesting}</p>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200/50 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Outcome</p>
            <p className="text-sm text-emerald-800 leading-relaxed">{day.outcome}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      {day.sections.map(sec => (
        <Card key={sec.id}>
          <h3 className="flex items-center gap-2.5 text-base font-semibold text-gray-800 mb-4">
            <span className="text-xs font-mono font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{sec.id}</span>
            {sec.title}
          </h3>
          {sec.blocks.map((block, i) => <ContentBlock key={i} block={block} />)}
        </Card>
      ))}

      {/* Lab */}
      <Card>
        <SectionLabel>Mini Lab</SectionLabel>
        <LabChecklist lab={day.lab} dayId={day.id} progress={progress} setProgress={setProgress} />
      </Card>

      {/* Speak Timer */}
      <Card>
        <SectionLabel>Speak It Out Loud</SectionLabel>
        <ul className="space-y-1.5 mb-4">
          {day.speakDrill.topics.map((t, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="w-1 h-1 rounded-full bg-teal-400 flex-shrink-0 mt-2" />
              <span className="text-sm text-gray-600">{t}</span>
            </li>
          ))}
        </ul>
        <SpeakTimer minutes={day.speakDrill.minutes} />
      </Card>

      {/* Quiz */}
      <Card>
        <SectionLabel>Quiz</SectionLabel>
        <QuizSection quiz={day.quiz} dayId={day.id} progress={progress} setProgress={setProgress} />
      </Card>

      {/* Claude Prompts */}
      <Card>
        <SectionLabel>Claude Prompts</SectionLabel>
        <ClaudePrompts prompts={day.claudePrompts} />
      </Card>

      {/* Notes */}
      <Card>
        <SectionLabel>Personal Notes</SectionLabel>
        <NotesSection dayId={String(day.id)} progress={progress} setProgress={setProgress} />
      </Card>
    </div>
  )
}

// ─── MemoryMapView ───────────────────────────────────────────────────────────
function MemoryMapView() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="font-display text-2xl sm:text-3xl text-gray-900 mb-1">Memory Map</h1>
      <p className="text-sm text-gray-400 mb-8">The entire course in 15 lines. Review before any interview.</p>
      <Card>
        <div className="divide-y divide-gray-100">
          {MEMORY_MAP.map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-1 sm:gap-6 py-3 first:pt-0 last:pb-0">
              <span className="font-mono text-xs font-semibold text-teal-600 sm:w-36 flex-shrink-0">{item.term}</span>
              <span className="text-sm text-gray-600 leading-relaxed">{item.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-2xl sm:text-3xl text-gray-900">25 Questions</h1>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{done}/25</span>
        </div>
        <p className="text-sm text-gray-400">Check off each when you can answer confidently without notes.</p>
      </div>

      <Card>
        <div className="space-y-1.5">
          {INTERVIEW_QUESTIONS.map((q, i) => {
            const practiced = !!progress.labItems[`iq-${i}`]
            const open = practice === i
            return (
              <div key={i} className={`border rounded-lg overflow-hidden transition-colors ${open ? 'border-gray-300 bg-gray-50/50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setPractice(open ? null : i)}>
                  <div onClick={(e) => { e.stopPropagation(); togglePracticed(i) }}
                    className={`w-[18px] h-[18px] rounded flex-shrink-0 flex items-center justify-center cursor-pointer transition-all ${practiced ? 'bg-teal-600 pop-in' : 'border-2 border-gray-300 hover:border-teal-400'}`}>
                    {practiced && <CheckIcon />}
                  </div>
                  <span className={`text-sm flex-1 transition-colors ${practiced ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    <span className="text-gray-400 font-mono text-xs mr-1.5">{i + 1}.</span>{q}
                  </span>
                  <ChevronIcon open={open} />
                </div>
                {open && (
                  <div className="fade-in px-4 pb-3 pt-0">
                    <p className="text-xs text-gray-400 mb-2">Answer out loud, then write key points:</p>
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
        <div className="space-y-2.5">
          {STRONGER_ANSWERS.map((a, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xs font-mono font-semibold text-gray-400 mt-0.5 w-5 text-right flex-shrink-0">{i + 1}</span>
              <p className="text-sm text-gray-600 italic leading-relaxed">"{a}"</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── OneDayCrashView ─────────────────────────────────────────────────────────
function OneDayCrashView() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(MEGA_PROMPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-gray-900 mb-1">One Day Plan</h1>
        <p className="text-sm text-gray-400">If you only have one day, focus on these topics in order.</p>
      </div>

      <Card>
        <SectionLabel>Priority Topics</SectionLabel>
        <ol className="space-y-2.5">
          {ONE_DAY_TOPICS.map((t, i) => (
            <li key={i} className="flex gap-3 items-center">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span className="text-sm text-gray-700">{t}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Mega Prompt</SectionLabel>
          <button onClick={copy}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${copied ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-50'}`}>
            <CopyIcon /> {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Paste into Claude or ChatGPT for a coached mock interview.</p>
        <div className="code-block rounded-lg overflow-hidden border border-slate-600/30">
          <pre className="!rounded-lg !text-xs !leading-relaxed" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{MEGA_PROMPT}</pre>
        </div>
      </Card>
    </div>
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
        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${active ? 'bg-slate-600/40 text-white' : 'text-slate-400 hover:bg-slate-600/20 hover:text-slate-300'}`}>
        <div className={`w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-semibold ${done ? 'bg-teal-600 text-white' : active ? 'bg-slate-500/40 text-slate-200' : 'bg-slate-700/50 text-slate-500'}`}>
          {done ? '✓' : isBonus ? '·' : item.num}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${active ? 'text-white' : ''}`}>{item.label}</p>
          <p className={`text-xs truncate ${active ? 'text-slate-400' : 'text-slate-500'}`}>{item.sub}</p>
        </div>
      </button>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-slate-600/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 tracking-tight">DDIA Course</h2>
            <p className="text-xs text-slate-500 mt-0.5">System Design Interview Prep</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-200 p-1">
            <CloseIcon />
          </button>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">Progress</span>
            <span className="text-slate-400 font-mono">{completedCount}/{DAYS.length}</span>
          </div>
          <div className="h-1 bg-slate-700/60 rounded-full overflow-hidden">
            <div className="progress-fill h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-2 py-3 space-y-0.5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Study Plan</p>
        {navDays.map(item => <NavBtn key={item.id} item={item} isBonus={false} />)}
        <div className="pt-3 pb-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Bonus</p>
        </div>
        {navBonus.map(item => <NavBtn key={item.id} item={item} isBonus={true} />)}
      </nav>

      {/* Reset */}
      <div className="px-4 py-3 border-t border-slate-600/30">
        <button onClick={() => {
          if (confirm('Reset all progress? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY); window.location.reload()
          }
        }} className="w-full text-xs text-slate-500 hover:text-red-400 transition-colors py-1">
          Reset progress
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-sidebar h-screen sticky top-0 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="sidebar-overlay lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-sidebar z-50 lg:hidden flex flex-col shadow-2xl">
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
    <div className="flex min-h-screen bg-surface">
      <Sidebar currentView={currentView} setView={setView} progress={progress}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600 hover:text-gray-900 p-1">
            <MenuIcon />
          </button>
          <h1 className="text-sm font-semibold text-gray-700 truncate">DDIA Course</h1>
        </header>

        <main ref={mainRef} className="content-scroll flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
