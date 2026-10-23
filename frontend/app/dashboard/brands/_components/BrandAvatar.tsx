type BrandAvatarProps = {
  name: string;
  image: string | null;
  size?: "md" | "lg";
};

// Shows the brand logo if `image` is set, otherwise an outlined perfume bottle placeholder.
export default function BrandAvatar({ name, image, size = "md" }: BrandAvatarProps) {
  const box = size === "lg" ? "h-20 w-20 rounded-2xl" : "h-11 w-11 rounded-lg";

  if (image) {
    return (
      // Plain <img>: brand images are arbitrary external URLs, which next/image
      // would only accept after listing every domain in next.config.ts.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={`${name} logo`}
        className={`${box} shrink-0 border border-slate-700 bg-white object-contain p-1`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name ? `${name}: no logo` : "No logo"}
      className={`${box} flex shrink-0 items-center justify-center border border-dashed border-amber-500/30 bg-amber-500/10 text-amber-400`}
    >
      <PerfumeBottleOutline className={size === "lg" ? "h-11 w-11" : "h-6 w-6"} />
    </div>
  );
}

// Line drawing of a perfume bottle (cap, neck, body, label), drawn in the current text color.
function PerfumeBottleOutline({ className }: { className?: string }) {
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
