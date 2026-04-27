import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx("relative overflow-hidden rounded-md", className)}
      style={{ background: "var(--neutral-100)" }}
    >
      <span
        className="absolute inset-0 block"
        style={{
          background: "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%)",
          backgroundSize: "400px 100%",
          animation: "shimmer 1.4s linear infinite",
        }}
      />
      <style>{`@keyframes shimmer { from { background-position: -400px 0 } to { background-position: 400px 0 } }`}</style>
    </div>
  );
}
