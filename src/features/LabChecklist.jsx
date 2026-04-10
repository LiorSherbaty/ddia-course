import { CheckIcon } from '../ui/Icons'
import { saveProgress } from '../lib/storage'

export default function LabChecklist({ lab, dayId, progress, setProgress }) {
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
      <p className="mb-3 text-xs font-medium text-[color:var(--color-muted)]">{done}/{lab.length} complete</p>
      <div className="space-y-3">
        {lab.map((item, i) => {
          const checked = !!progress.labItems[`${dayId}-${i}`]
          return (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <div onClick={() => toggle(i)} className={`mt-0.5 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded transition-all ${checked ? 'pop-in bg-[color:var(--color-accent)] text-white shadow-[0_10px_20px_rgba(13,95,95,0.2)]' : 'border-2 border-[color:var(--color-accent)]/30 bg-white group-hover:border-[color:var(--color-accent)]/60'}`}>
                {checked && <CheckIcon />}
              </div>
              <span className={`text-sm leading-7 transition-colors ${checked ? 'text-[color:#9a9386] line-through' : 'text-[color:var(--color-muted)]'}`}>{item}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
