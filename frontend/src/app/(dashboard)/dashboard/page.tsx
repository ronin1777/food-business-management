import { DashboardContent } from "@/components/dashboard/DashboardContent";

type DashboardPageProps = {
  searchParams: Promise<{
    range?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  return (
    <DashboardContent
      range={params.range}
    />
  );
}