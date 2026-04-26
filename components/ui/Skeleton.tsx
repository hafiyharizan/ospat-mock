import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-md overflow-hidden relative",
        "bg-zinc-200 dark:bg-white/[0.06]",
        className,
      )}
    >
      <span
        className="absolute inset-0 block animate-shimmer"
        style={{
          background:
            "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.4) 50%, transparent 75%)",
          backgroundSize: "400px 100%",
        }}
      />
    </div>
  );
}

