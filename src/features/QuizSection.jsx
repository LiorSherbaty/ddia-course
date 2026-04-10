import { ChevronIcon } from '../ui/Icons'
import { saveProgress } from '../lib/storage'

export default function QuizSection({ quiz, dayId, progress, setProgress }) {
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
          <div key={i} className={`overflow-hidden rounded-[22px] border transition-colors ${open ? 'border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/70' : 'border-[color:var(--color-faint)] bg-white/80'}`}>
            <button onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">
              <span className="pr-4 text-sm leading-6 text-[color:#2d2723]">
                <span className="mr-2 font-mono text-xs text-[color:var(--color-accent)]">Q{i + 1}</span>
                {item.q}
              </span>
              <ChevronIcon open={open} />
            </button>
            {open && (
              <div className="fade-in border-t border-[color:var(--color-faint)] px-4 py-3">
                <p className="text-sm leading-7 text-[color:var(--color-muted)]">{item.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
