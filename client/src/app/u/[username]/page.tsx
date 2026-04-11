import { notFound } from "next/navigation";
import ActivityStatsWrapper from "@/app/ui/stats/ActivityStatsWrapper";
import { fetchPublicActivities } from "@/lib/data";
export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const activities = await fetchPublicActivities(username);

  if (!activities) notFound();

  return (
    <main className="mx-auto px-4 py-8">
      <ActivityStatsWrapper activityList={activities} />
    </main>
  );
}
