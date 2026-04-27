import { getDashboardKpis } from "@/lib/data";
import { LiveDashboard } from "@/components/dashboard/LiveDashboard";

export default function LivePage() {
  const kpis = getDashboardKpis();
  return <LiveDashboard kpis={kpis} />;
}
