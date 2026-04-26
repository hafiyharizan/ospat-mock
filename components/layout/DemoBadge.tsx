import { FlaskConical } from "lucide-react";

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-amber-300">
      <FlaskConical className="h-3 w-3" />
      Demo data only
    </span>
  );
}
