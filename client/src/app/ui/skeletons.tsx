import { TableCell, TableRow } from "@/components/ui/table";

export function RowSkeleton({
  rows = 1,
  cells = 8,
}: {
  rows?: number;
  cells?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: cells }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <div className="h-6 rounded bg-muted animate-pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-lg bg-zinc-800 animate-pulse w-full">
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-6 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
    </div>
  );
}
