// Line drawing of a perfume bottle (cap, neck, body, label), drawn in the current text color.
// Used as the "no logo" placeholder for brands and as the icon for perfumes.
export default function PerfumeBottleOutline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Cap */}
      <rect x="9" y="1.75" width="6" height="3.75" rx="1" />
      {/* Neck */}
      <path d="M10.5 5.5v2.25M13.5 5.5v2.25" />
      {/* Bottle body */}
      <rect x="5" y="7.75" width="14" height="14.5" rx="3" />
      {/* Label */}
      <rect x="8.5" y="12.5" width="7" height="5" rx="0.75" opacity="0.7" />
      {/* Glass highlight */}
      <path d="M7.5 10.5v2" opacity="0.5" />
    </svg>
  );
}
