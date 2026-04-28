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
    <div className="mb-5 flex flex-col items-start justify-between gap-3 animate-fade-in sm:mb-6 sm:flex-row sm:gap-4">
      <div className="w-full min-w-0">
        <h1
          className="text-[24px] font-semibold leading-tight sm:text-[28px]"
          style={{ color: "var(--fg)", letterSpacing: "-0.018em" }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 w-full max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
    </div>
  );
}
