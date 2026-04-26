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
    <div className="panel flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-zinc-500">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-zinc-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
