export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 animate-fade-in">
      <div>
        <h1
          className="text-[28px] font-semibold leading-tight"
          style={{ color: "var(--fg)", letterSpacing: "-0.018em" }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
