import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="panel-padded text-center max-w-md mx-auto mt-10">
      <h1 className="text-lg font-semibold text-white">Employee not found</h1>
      <p className="mt-1 text-sm text-zinc-400">
        We couldn’t find that employee in the demo dataset.
      </p>
      <Link
        href="/feed"
        className="btn-soft mt-4 inline-flex"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to live feed
      </Link>
    </div>
  );
}
