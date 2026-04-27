import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Reports"
        description="Compliance exports, shift summaries, and audit trail downloads."
      />
      <EmptyState
        icon={Download}
        title="Reports coming soon"
        description="Export shift reports, compliance summaries, and 90-day audit trails by site or crew."
      />
    </div>
  );
}
