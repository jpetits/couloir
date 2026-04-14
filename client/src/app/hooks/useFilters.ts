import { useRouter, useSearchParams } from "next/navigation";

import { ActivityFilters, ActivityFiltersSchema } from "@/lib/schema";

export const useFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: ActivityFilters = ActivityFiltersSchema.parse(
    Object.fromEntries(searchParams.entries()),
  );

  function setFilters(newFilters: Partial<ActivityFilters>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`?${params}`);
  }

  return { filters, setFilters };
};
