import ProfileForm from "@/components/profile/ProfileForm";
import { fetchUser } from "@/lib/data";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await fetchUser(username);

  return (
    <div className="flex flex-col items-center justify-center">
      <ProfileForm user={user} />
    </div>
  );
}
