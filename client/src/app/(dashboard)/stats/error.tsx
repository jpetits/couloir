"use client";

import ErrorDisplay from "@/app/ui/error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      message={error.message || "Something went wrong while loading the stats."}
      onRetry={reset}
    />
  );
}
