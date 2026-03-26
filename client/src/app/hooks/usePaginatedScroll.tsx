import { useEffect, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

export function usePaginatedScroll<T>(
  initialMovieList: T[],
  fetchMorePath: string,
  ref: React.RefObject<HTMLDivElement | null>,
) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useInfiniteQuery({
      queryKey: ["movies", fetchMorePath],
      queryFn: async ({ pageParam }) => {
        const url = new URL(fetchMorePath, window.location.origin);
        url.searchParams.set("page", String(pageParam));
        return await fetch(url.toString()).then((res) => res.json());
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, _, lastPageParam) =>
        lastPage.length > 0 ? lastPageParam + 1 : undefined,
      initialData: {
        pages: [initialMovieList],
        pageParams: [1],
      },
      staleTime: Infinity,
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, error, ref]);

  const allItems = useMemo(() => data.pages.flat(), [data.pages]);

  return { data, allItems, hasNextPage, isFetchingNextPage, error };
}
