import { getFeedRows } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { FeedTable } from "@/components/feed/FeedTable";

export default function FeedPage() {
  return <div><PageHeader title="Live Workforce Readiness Feed" description="Simulated OSPAT-style pre-start assessments with reaction, focus, fatigue, coordination, and AI z-score anomaly output." /><FeedTable rows={getFeedRows()} /></div>;
}
