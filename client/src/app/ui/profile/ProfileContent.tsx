"use client";

import { Activity } from "@/lib/schema";
import ProfileStats from "./ProfileStats";
import ActivityStatsWrapper from "../stats/ActivityStatsWrapper";
import { useEffect } from "react";
import { useMapStore } from "@/store/mapStore";

export default function ProfileContent({
  activitiyList,
  username,
}: {
  activitiyList: Activity[];
  username: string;
}) {
  const setActivityIdList = useMapStore((state) => state.setActivityIdList);
  useEffect(() => {
    setActivityIdList(activitiyList.map((a) => a.id));
  }, [activitiyList]);
  return (
    <>
      <ProfileStats activitiyList={activitiyList} username={username} />
      <ActivityStatsWrapper activityList={activitiyList} />
    </>
  );
}
