import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96 mb-6" />
      <div className="panel p-5 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-32 ml-auto" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
