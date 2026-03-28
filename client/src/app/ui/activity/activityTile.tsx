"use client";
import Link from "next/link";
import { useState, memo } from "react";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import { Activity } from "@/lib/schema";
import { ROUTES } from "@/routing/constants";
import { useDeleteActivity } from "@/app/hooks/useDeleteActivity";
import ActivityMapWrapper from "./activityMapWrapper";
import ModalDelete from "../modal/modalDelete";
import { TableCell } from "@/components/ui/table";

const ActivityTile = memo(function ActivityTile({
  activity,
}: {
  activity: Activity;
}) {
  const { mutate: deleteActivity } = useDeleteActivity();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="group block rounded-lg overflow-hidden bg-zinc-900  hover:bg-zinc-700 transition-all w-full">
      <Link
        prefetch={false}
        key={activity.id}
        href={ROUTES.activity(activity.id.toString())}
      >
        <TableCell>{activity.date}</TableCell>
        <TableCell>{(activity.distance / 1000).toFixed(1)} km</TableCell>
        <TableCell>{Math.round(activity.duration / 60)} min</TableCell>

        <TableCell>{Math.round(activity.elevGain)} m</TableCell>
        <TableCell>
          {(activity.distance / 1000 / (activity.duration / 3600)).toFixed(1)}{" "}
          km/h
        </TableCell>
        <TableCell>{activity.maxSpeed.toFixed(1)} km/h</TableCell>
      </Link>
      {activity.points && activity.points.length > 0 && (
        <ActivityMapWrapper points={activity.points} />
      )}
      <div className="p-2">
        <button onClick={() => setShowModal(true)} className="text-red-500">
          <TrashIcon className="h-5 w-5 hover:cursor-pointer" />
        </button>
      </div>
      {showModal && (
        <ModalDelete
          onConfirm={() => {
            deleteActivity(activity.id);
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
});

export default ActivityTile;
