import { useEffect, useMemo } from "react";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import { ROUTES } from "@/routing/constants";

import { useApi } from "./useApi";
import { useFilters } from "./useFilters";

export function usePaginatedScroll<T>(
  initialMovieList: T[],
  loadMoreRef: React.RefObject<HTMLDivElement | null>,
) {
  const apiFetch = useApi();
  const { filters } = useFilters();
  const fetchMorePath = ROUTES.api.activities(filters);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["activities", filters],
    queryFn: async ({ pageParam }) => {
      const [base, query] = fetchMorePath.split("?");
      const params = new URLSearchParams(query);
      params.set("page", String(pageParam));
      return apiFetch(`${base}?${params}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      (
        filters.limit
          ? lastPage.length === Number(filters.limit)
          : lastPage.length > 0
      )
        ? lastPageParam + 1
        : undefined,
    initialData: {
      pages: [initialMovieList],
      pageParams: [1],
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !error
        ) {
          observer.disconnect();
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, error, loadMoreRef]);

  const allItems = useMemo(() => data.pages.flat(), [data.pages]);

  return { data, allItems, hasNextPage, isFetchingNextPage, error, isLoading };
}
