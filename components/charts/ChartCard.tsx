import { Card, CardHeader } from "@/components/ui/Card";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  height = "h-72",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  height?: string;
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div className={`px-2 pb-3 pt-3 ${height}`}>{children}</div>
    </Card>
  );
}
