export function SearchSkeleton() {
  return (
    <div className="p-6">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
    </div>
  );
}

export function ActivityListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, pageIndex) => (
        <div
          key={pageIndex}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <ActivityTileSkeleton key={index} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ActivityTileSkeleton() {
  return <div className="aspect-[2/3] rounded-lg bg-zinc-800 animate-pulse" />;
}
