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
