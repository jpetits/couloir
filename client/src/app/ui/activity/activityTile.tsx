"use client";
import Link from "next/link";
import { useState, memo } from "react";
import { Activity } from "@/lib/schema";
import { ROUTES } from "@/routing/constants";

const ActivityTile = memo(function ActivityTile({
  activity,
  priority,
}: {
  activity: Activity;
  priority?: boolean;
}) {
  return (
    <Link
      prefetch={false}
      key={activity.id}
      href={ROUTES.activity(activity.id.toString())}
      className="group block rounded-lg overflow-hidden bg-zinc-900 hover:ring-2 hover:ring-zinc-500 transition-all"
    >
      <h1>{activity.id}</h1>
      <p>{activity.date}</p>
      <ul>
        <li>Durée : {Math.round(activity.duration / 60)} min</li>
        <li>Distance : {(activity.distance / 1000).toFixed(1)} km</li>
        <li>Dénivelé : {Math.round(activity.elevGain)} m</li>
        <li>Vitesse max : {activity.maxSpeed.toFixed(1)} km/h</li>
        <li>
          Vitesse moy :{" "}
          {(activity.distance / (activity.duration / 3600)).toFixed(1)} km/h
        </li>
      </ul>
      <p>{activity.points?.length} points GPS enregistrés</p>
    </Link>
  );
});

export default ActivityTile;
