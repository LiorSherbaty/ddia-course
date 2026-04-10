export const DAY_ACCENTS = {
  1: { base: '#0d5f5f', soft: '#e8f0ee', label: 'Teal' },
  2: { base: '#5a6b3f', soft: '#edf0e5', label: 'Moss' },
  3: { base: '#d97844', soft: '#f9e7d8', label: 'Amber' },
  4: { base: '#8b2e2e', soft: '#f0dcdc', label: 'Oxblood' },
  5: { base: '#3e3e7a', soft: '#e0e0ec', label: 'Indigo' },
  6: { base: '#a0572f', soft: '#f3e1d4', label: 'Clay' },
  7: { base: '#b08a2c', soft: '#f5ebce', label: 'Gold' },
}

export function getDayAccent(dayId) {
  return DAY_ACCENTS[dayId] || DAY_ACCENTS[1]
}

export function dayAccentStyle(dayId) {
  const a = getDayAccent(dayId)
  return { '--day-accent': a.base, '--day-accent-soft': a.soft }
}
