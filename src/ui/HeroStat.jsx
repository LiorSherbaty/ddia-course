export default function HeroStat({ label, value }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--color-faint)] bg-white/74 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[color:#9a9386]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--color-ink)]">{value}</p>
    </div>
  )
}
