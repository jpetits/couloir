import { useEffect, useMemo } from "react";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { useFilters } from "./useFilters";
import { ROUTES } from "@/routing/constants";

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
    queryKey: [fetchMorePath],
    queryFn: async ({ pageParam }) => {
      const url = new URL(fetchMorePath);
      url.searchParams.set("page", String(pageParam));
      return apiFetch(url.toString());
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length > 0 ? lastPageParam + 1 : undefined,
    initialData: {
      pages: [initialMovieList],
      pageParams: [1],
    },
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
