import { LOW_VOLUME_THRESHOLD_ML } from "./decantBottle";

type VolumeBarProps = {
  remainingMl: number;
  initialMl: number;
  size?: "sm" | "lg";
};

// Horizontal gauge of the perfume left in a bottle.
// Green above half, amber below half, red under the low threshold (or empty).
export default function VolumeBar({ remainingMl, initialMl, size = "sm" }: VolumeBarProps) {
  const percent = initialMl > 0 ? Math.round((remainingMl / initialMl) * 100) : 0;
  const color =
    remainingMl < LOW_VOLUME_THRESHOLD_ML
      ? "bg-red-400"
      : percent < 50
        ? "bg-amber-400"
        : "bg-emerald-400";

  return (
    <div
      role="meter"
      aria-label="Remaining perfume"
      aria-valuemin={0}
      aria-valuemax={initialMl}
      aria-valuenow={remainingMl}
      aria-valuetext={`${remainingMl} of ${initialMl} ml remaining`}
      className={`w-full overflow-hidden rounded-full bg-slate-800 ${size === "lg" ? "h-3" : "h-1.5"}`}
    >
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
