export default function TableBlock({ block }) {
  return (
    <div className="my-4 overflow-x-auto rounded-[24px] border border-[color:var(--color-faint)] bg-white/80">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[color:var(--color-accent-soft)]/80">
            {block.headers.map((h, i) => (
              <th key={i} className="border-b border-[color:var(--color-faint)] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-deep)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white/80' : 'bg-[color:var(--color-accent-soft)]/40'}>
              {row.map((cell, j) => (
                <td key={j} className="border-b border-[color:var(--color-faint)] px-4 py-3 align-top text-[15px] leading-7 text-[color:var(--color-muted)]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
