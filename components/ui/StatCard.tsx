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
  const accentColor =
    accent === "positive" ? "var(--success)"
    : accent === "warning"  ? "var(--warning)"
    : accent === "danger"   ? "var(--danger)"
    : "var(--border)";

  return (
    <div
      className="card-padded relative overflow-hidden"
      style={{ borderLeft: `2px solid ${accentColor}` }}
    >
      <div className="text-[12.5px] font-medium" style={{ color: "var(--fg-muted)" }}>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="font-mono text-[26px] font-semibold leading-none"
          style={{ color: "var(--fg)", letterSpacing: "-0.01em", fontFeatureSettings: '"tnum"' }}
        >
          {value}
        </span>
        {typeof delta === "number" && <DeltaChip value={delta} />}
      </div>
      {hint && (
        <div className="mt-1 text-[12px]" style={{ color: "var(--fg-subtle)" }}>{hint}</div>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function DeltaChip({ value }: { value: number }) {
  const positive = value > 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[11px] font-medium"
      style={{
        background: positive
          ? "color-mix(in oklch, var(--success) 12%, var(--bg))"
          : "color-mix(in oklch, var(--danger) 12%, var(--bg))",
        color: positive ? "var(--success)" : "var(--danger)",
      }}
    >
      {positive ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}
