import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="card-padded mx-auto mt-10 max-w-md text-center">
      <h1 className="font-display text-2xl leading-none" style={{ color: "var(--fg)" }}>
        Person not found
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
        We could not find that person in the demo dataset.
      </p>
      <Link
        href="/feed"
        className="btn-secondary mt-4 inline-flex"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to people feed
      </Link>
    </div>
  );
}
