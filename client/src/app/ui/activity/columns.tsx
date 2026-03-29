import { Activity } from "@/lib/schema";
import { ColumnDef, TableMeta } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatDate, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/routing/constants";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onDelete: (activity: Activity) => void;
  }
}

export const columns: ColumnDef<Activity>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <Link
          prefetch={false}
          key={row.original.id}
          href={ROUTES.activity(row.original.id.toString())}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return <div className="font-medium">{formatDate(row.original.date)}</div>;
    },
  },
  {
    accessorKey: "distance",
    header: "Distance",
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {(row.original.distance / 1000).toFixed(1)} km
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {formatDuration(row.original.duration, false)}
        </div>
      );
    },
  },
  {
    accessorKey: "elevLoss",
    header: "Dénivelé",
  },
  {
    accessorKey: "averageSpeed",
    header: "Vitesse moy",
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {(
            row.original.distance /
            1000 /
            (row.original.duration / 3600)
          ).toFixed(1)}
        </div>
      );
    },
  },
  {
    accessorKey: "maxSpeed",
    header: "Vitesse max",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const activity = row.original;
      const { onDelete } = table.options.meta as TableMeta<Activity>;

      return (
        <Button onClick={() => onDelete(activity)} variant="outline">
          <TrashIcon className="h-5 w-5 hover:cursor-pointer" />
        </Button>
      );
    },
  },
];
