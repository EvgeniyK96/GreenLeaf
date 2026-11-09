/** Собственный знак страницы (не логотип компании): росток из двух листьев. */
export function LeafMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="10" fill="#2b7a4b" />
      <path d="M16 26V14" stroke="#eaf4e4" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 15c0-5 3-8 8-8 0 5-3 8-8 8Z" fill="#b6dd4c" />
      <path d="M16 19c0-4-2.6-6.5-7-6.5 0 4 2.6 6.5 7 6.5Z" fill="#eaf4e4" />
    </svg>
  )
}
