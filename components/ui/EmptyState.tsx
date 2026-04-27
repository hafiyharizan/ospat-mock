import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="card flex flex-col items-center justify-center px-6 py-14 text-center"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)", color: "var(--fg-subtle)" }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <h3
        className="mt-3 text-[18px] font-semibold leading-snug"
        style={{ color: "var(--fg)" }}
      >
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-[13px]" style={{ color: "var(--fg-muted)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
