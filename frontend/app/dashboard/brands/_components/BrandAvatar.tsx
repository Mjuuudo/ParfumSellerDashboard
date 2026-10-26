import PerfumeBottleOutline from "../../_components/PerfumeBottleOutline";

type BrandAvatarProps = {
  name: string;
  image: string | null;
  size?: "sm" | "md" | "lg";
};

const boxSizes = {
  sm: "h-7 w-7 rounded-md",
  md: "h-11 w-11 rounded-lg",
  lg: "h-20 w-20 rounded-2xl",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-11 w-11",
};

// Shows the brand logo if `image` is set, otherwise an outlined perfume bottle placeholder.
export default function BrandAvatar({ name, image, size = "md" }: BrandAvatarProps) {
  const box = boxSizes[size];

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
      <PerfumeBottleOutline className={iconSizes[size]} />
    </div>
  );
}
