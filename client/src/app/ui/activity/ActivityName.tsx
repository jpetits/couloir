"use client";

import { useOptimistic, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/app/hooks/useApi";
import { Activity } from "@/lib/schema";
import { patchActivity } from "@/lib/dataClient";

export default function ActivityName({ activity }: { activity: Activity }) {
  const router = useRouter();
  const apiFetch = useApi();

  const [optimisticName, setOptimisticName] = useOptimistic(activity.name);
  const [editing, setEditing] = useState(false);
  const commit = async (newValue: string) => {
    startTransition(async () => {
      setOptimisticName(newValue);
      setEditing(false);
      if (newValue !== activity.name) {
        await patchActivity(apiFetch, activity.id, { name: newValue });
        router.refresh();
      }
    });
  };

  if (!editing) {
    return (
      <h1
        onClick={() => setEditing(true)}
        className="text-2xl font-bold cursor-pointer"
      >
        {optimisticName}
      </h1>
    );
  }

  return (
    <input
      defaultValue={activity.name}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(e.currentTarget.value);
        }
        if (e.key === "Escape") {
          setEditing(false);
        }
      }}
      className="text-2xl font-bold border-b border-gray-300 focus:outline-none focus:border-blue-500"
    />
  );
}
