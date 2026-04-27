import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Settings"
        description="Site configuration, notification routing, and personal-band calibration thresholds."
      />
      <EmptyState
        icon={Settings}
        title="Settings coming soon"
        description="Configure site parameters, supervisor routing rules, and AI signal sensitivity."
      />
    </div>
  );
}
