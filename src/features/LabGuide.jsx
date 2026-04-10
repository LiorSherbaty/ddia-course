import { useState } from 'react'
import { LAB_GUIDES } from '../data/labGuides'
import { ChevronIcon } from '../ui/Icons'
import SectionLabel from '../ui/SectionLabel'
import CodeBlock from '../blocks/CodeBlock'

export default function LabGuide({ dayId }) {
  const guide = LAB_GUIDES[dayId]
  const [openTask, setOpenTask] = useState(null)

  if (!guide) return null

  return (
    <div className="mt-6 border-t border-[color:var(--color-faint)] pt-6">
      <SectionLabel>Step-by-Step Guide</SectionLabel>
      <div className="space-y-2.5">
        {guide.map((item, ti) => {
          const isOpen = openTask === ti
          return (
            <div key={ti} className="overflow-hidden rounded-[22px] border border-[color:var(--color-faint)] bg-white/70">
              <button
                onClick={() => setOpenTask(isOpen ? null : ti)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[color:var(--color-accent-soft)]/60"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] text-xs font-semibold text-[color:var(--color-accent)]">{ti + 1}</span>
                <span className="flex-1 text-sm font-medium text-[color:#2d2723]">{item.task}</span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="fade-in border-t border-[color:var(--color-faint)] bg-[color:var(--color-accent-soft)]/35 px-4 pb-4 pt-2">
                  {item.steps.map((step, si) => (
                    <div key={si} className="mt-4 first:mt-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-white px-2 py-1 font-mono text-[11px] font-semibold text-[color:var(--color-accent)]">{ti + 1}.{si + 1}</span>
                        <h5 className="text-sm font-semibold text-[color:var(--color-ink)]">{step.title}</h5>
                      </div>
                      {step.text && <p className="mb-2 text-sm leading-7 text-[color:var(--color-muted)] whitespace-pre-line">{step.text}</p>}
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
