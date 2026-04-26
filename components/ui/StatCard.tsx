import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  hint,
  accent = "default",
  children,
}: {
  label: string;
  value: string | number;
  delta?: number;
  hint?: string;
  accent?: "default" | "positive" | "warning" | "danger";
  children?: React.ReactNode;
}) {
  const accentRing =
    accent === "positive"
      ? "before:bg-emerald-400/40"
      : accent === "warning"
        ? "before:bg-amber-400/40"
        : accent === "danger"
          ? "before:bg-rose-400/40"
          : "before:bg-indigo-400/40";

  return (
    <div
      className={clsx(
        "panel-padded relative overflow-hidden animate-fade-up",
        "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",
        "before:absolute before:left-0 before:top-5 before:bottom-5 before:w-px",
        accentRing,
      )}
    >
      <div className="label">{label}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="metric">{value}</div>
        {typeof delta === "number" && <DeltaPill value={delta} />}
      </div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function DeltaPill({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
        <Minus className="h-3 w-3" /> 0.0%
      </span>
    );
  }
  const positive = value > 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        positive
          ? "bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
          : "bg-rose-400/10 text-rose-600 dark:text-rose-300",
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

