import Link from "next/link";

import { ROUTES } from "@/routing/constants";

export default function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-zinc-700">404</p>
      <h1 className="text-2xl font-bold text-zinc-100">Not found</h1>
      <p className="text-zinc-400 text-sm">{message}</p>
      <Link
        href={ROUTES.activities}
        className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:text-zinc-100 hover:border-zinc-500 transition-colors"
      >
        Back to list
      </Link>
    </div>
  );
}
