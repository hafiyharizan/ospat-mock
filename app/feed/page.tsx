import { getFeedRows } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { FeedTable } from "@/components/feed/FeedTable";

export default function PeoplePage() {
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="People"
        description="All workers · personal-band deviation, anomaly signal, and shift history."
      />
      <FeedTable rows={getFeedRows()} />
    </div>
  );
}
