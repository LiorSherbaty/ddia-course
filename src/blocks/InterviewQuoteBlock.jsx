export default function InterviewQuoteBlock({ block }) {
  return (
    <div className="my-4 rounded-[24px] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/70 px-5 py-4">
      <p className="text-[15px] italic leading-7 text-[color:var(--color-accent-deep)] whitespace-pre-line">{block.text}</p>
    </div>
  )
}
