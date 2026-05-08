"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useApi } from "@/app/hooks/useApi";
import { patchUser } from "@/lib/dataClient";
import { User } from "@/lib/schema";

export default function ProfileForm({ user }: { user: User }) {
  const apiFetch = useApi();
  const router = useRouter();

  const [localUser, setLocalUser] = useState(user);

  const togglePublic = async () => {
    const newUser = { ...localUser, isPublic: !localUser.isPublic };
    setLocalUser(newUser);
    await patchUser(apiFetch, newUser);
  };

  const setUsername = async (username: string) => {
    const newUser = { ...localUser, username };
    setLocalUser(newUser);
    await patchUser(apiFetch, newUser);
    router.push(`/u/${username}/edit`);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <input
        type="text"
        defaultValue={localUser.username}
        className="mb-4 p-2 border border-gray-300 rounded"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="checkbox"
        id="isPublic"
        name="isPublic"
        defaultChecked={localUser.isPublic}
        onChange={togglePublic}
      />
      <label htmlFor="isPublic">Public Profile</label>
    </div>
  );
}
