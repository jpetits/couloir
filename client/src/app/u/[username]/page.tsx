import { notFound } from "next/navigation";
import { fetchPublicActivities } from "@/lib/data";
import ProfileContent from "@/app/ui/profile/ProfileContent";

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
      <ProfileContent activitiyList={activities} username={username} />
    </main>
  );
}
