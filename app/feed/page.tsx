import { getFeedRows } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { FeedTable } from "@/components/feed/FeedTable";

export default function FeedPage() {
  const rows = getFeedRows();
  return (
    <div>
      <PageHeader
        title="Live Assessment Feed"
        description="Latest readiness assessments across all sites. Click a row to drill into an employee."
      />
      <FeedTable rows={rows} />
    </div>
  );
}
