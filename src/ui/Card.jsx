export default function Card({ children, className = '' }) {
  return (
    <div className={`surface-panel rounded-[28px] p-5 sm:p-6 lg:p-7 ${className}`}>
      {children}
    </div>
  )
}
