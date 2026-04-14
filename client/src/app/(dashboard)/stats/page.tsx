import { Suspense } from "react";

import StatsContent from "@/app/ui/stats/StatsContent";

export default async function StatsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StatsContent />
    </Suspense>
  );
}
