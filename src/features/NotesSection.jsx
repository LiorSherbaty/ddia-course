import { saveProgress } from '../lib/storage'

export default function NotesSection({ dayId, progress, setProgress }) {
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
        <span className="text-xs font-medium text-[color:var(--color-muted)]">Auto-saved locally</span>
        {!val && (
          <button onClick={() => onChange({ target: { value: TEMPLATE } })}
            className="text-xs font-semibold text-[color:var(--color-accent)] transition-colors hover:text-[color:var(--color-accent-deep)]">
            Use template
          </button>
        )}
      </div>
      <textarea value={val} onChange={onChange} rows={10} placeholder="Write your notes here..." />
    </div>
  )
}
