import { notFound } from "next/navigation";
import { fetchPublicActivities } from "@/lib/data";
import ProfileContent from "@/app/ui/profile/ProfileContent";

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
      <ProfileContent activityList={activityList} username={username} />
    </main>
  );
}
