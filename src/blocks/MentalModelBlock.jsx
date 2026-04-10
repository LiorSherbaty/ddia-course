import { dayAccentStyle } from '../lib/theme'

export default function MentalModelBlock({ block, dayId }) {
  return (
    <figure className="my-6 border-l-4 pl-5 pr-2 py-2" style={{ ...dayAccentStyle(dayId), borderColor: 'var(--day-accent)' }}>
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--day-accent)' }}>
        Mental model
      </p>
      <blockquote className="mt-2 font-display text-xl italic leading-snug text-[color:var(--color-ink)] sm:text-2xl">
        {block.text}
      </blockquote>
    </figure>
  )
}
