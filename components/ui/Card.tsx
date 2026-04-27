import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("card", className)} {...rest} />;
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-3"
      style={{ borderBottom: "1px solid var(--border-faint)" }}
    >
      <div>
        <h3 className="text-[13.5px] font-semibold" style={{ color: "var(--fg)" }}>{title}</h3>
        {subtitle && (
          <p className="font-mono text-[11.5px] mt-0.5" style={{ color: "var(--fg-subtle)" }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("p-5", className)} {...rest} />;
}
