import { Activity } from "@/lib/schema";
import { useShallow } from "zustand/react/shallow";
import { Column, ColumnDef, TableMeta } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatDate, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/routing/constants";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import ChevronUpIcon from "@heroicons/react/24/outline/ChevronUpIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import ChevronUpDownIcon from "@heroicons/react/24/outline/ChevronUpDownIcon";
import CheckIcon from "@heroicons/react/24/outline/CheckIcon";
import StopIcon from "@heroicons/react/24/outline/StopIcon";
import { useActivitySelectionStore } from "@/store/activitySelection";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onDelete: (activity: Activity) => void;
  }
}

const HeaderCell = ({
  column,
  title,
}: {
  column: Column<Activity>;
  title: string;
}) => {
  const toggleSorting = () => {
    const isSorted = column.getIsSorted();
    column.toggleSorting(isSorted === "asc");
  };

  return (
    <button
      onClick={toggleSorting}
      className="flex items-center cursor-pointer  text-gray-400  gap-1"
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ChevronUpIcon className="h-3 w-3" />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDownIcon className="h-3 w-3" />
      ) : (
        <ChevronUpDownIcon className="h-3 w-3" />
      )}
    </button>
  );
};

export const columns: ColumnDef<Activity>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <HeaderCell column={column} title="Name" />,
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
    header: ({ column }) => <HeaderCell column={column} title="Date" />,
    cell: ({ row }) => {
      return <div className="font-medium">{formatDate(row.original.date)}</div>;
    },
  },
  {
    accessorKey: "distance",
    header: ({ column }) => <HeaderCell column={column} title="Distance" />,
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {(row.original.distance / 1000).toFixed(1)} km
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => <HeaderCell column={column} title="Duration" />,
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {formatDuration(row.original.duration, false)}
        </div>
      );
    },
  },
  {
    accessorKey: "elevLoss",
    header: ({ column }) => <HeaderCell column={column} title="Dénivelé" />,
  },
  {
    accessorKey: "averageSpeed",
    enableSorting: false,
    header: "Vitesse moy",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
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
    header: ({ column }) => <HeaderCell column={column} title="Vitesse max" />,
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => {
      const activity = row.original;
      const { onDelete } = table.options.meta as TableMeta<Activity>;

      const [toggle, selected] = useActivitySelectionStore(
        useShallow((state) => [
          state.toggle,
          state.selected.includes(activity.id),
        ]),
      );

      return (
        <div className="flex gap-2 justify-end">
          <Button onClick={() => toggle(activity.id)} variant="outline">
            {selected ? (
              <CheckIcon className="h-5 w-5 text-green-500" />
            ) : (
              <StopIcon className="h-5 w-5 text-gray-400" />
            )}
          </Button>
          <Button onClick={() => onDelete(activity)} variant="outline">
            <TrashIcon className="h-5 w-5 hover:cursor-pointer text-red-500" />
          </Button>
        </div>
      );
    },
  },
];
