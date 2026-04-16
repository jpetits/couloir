import { notFound } from "next/navigation";

import ProfileContent from "@/app/ui/profile/ProfileContent";
import { fetchPublicActivities } from "@/lib/data";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const activityList = await fetchPublicActivities(username);

  if (!activityList) notFound();

  return (
    <main className="mx-auto px-4">
      <ProfileContent activityList={activityList} />
    </main>
  );
}
