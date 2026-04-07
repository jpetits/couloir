import StatsContent from "@/app/ui/stats/StatsContent";
import { Suspense } from "react";

export default async function StatsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StatsContent />
    </Suspense>
  );
}
