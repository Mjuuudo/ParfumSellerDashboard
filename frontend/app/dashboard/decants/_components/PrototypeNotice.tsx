import { FlaskConical } from "lucide-react";

// Marks a screen as a prototype running on mock data, so nobody mistakes it for real stock.
export default function PrototypeNotice({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2">
        <FlaskConical size={17} className="mt-0.5 shrink-0 text-sky-400" />
        <span>
          <span className="font-semibold text-sky-300">Prototype · mock data.</span> {children}
        </span>
      </p>
      {action}
    </div>
  );
}
