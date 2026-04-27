import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="panel-padded text-center max-w-md mx-auto mt-10">
      <h1 className="font-display text-2xl leading-none text-zinc-950">Person not found</h1>
      <p className="mt-2 text-sm text-zinc-500">
        We could not find that person in the demo dataset.
      </p>
      <Link
        href="/feed"
        className="btn-soft mt-4 inline-flex"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to people feed
      </Link>
    </div>
  );
}
