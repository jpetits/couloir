"use client";

import ErrorDisplay from "@/app/ui/error";

export default function Error() {
  return (
    <ErrorDisplay message={"Something went wrong while loading the stats."} />
  );
}
