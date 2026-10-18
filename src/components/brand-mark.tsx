type Props = { className?: string; coralDot?: boolean };

export function BrandMark({ className = "h-5 w-5", coralDot = true }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path
        d="M5 5 H19 L27 13 V25 A2 2 0 0 1 25 27 H5 A2 2 0 0 1 3 25 V7 A2 2 0 0 1 5 5 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12 H19 M14 12 V22"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {coralDot && <circle cx="23" cy="9" r="2.4" fill="var(--coral)" />}
    </svg>
  );
}
