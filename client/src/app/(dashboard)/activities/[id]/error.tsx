"use client";

import ErrorDisplay from "@/components/error";

export default function Error() {
  return (
    <ErrorDisplay
      message={"Something went wrong while loading the activity."}
    />
  );
}
