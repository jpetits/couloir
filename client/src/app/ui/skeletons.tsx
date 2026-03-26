export function MovieListSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] rounded-lg bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    </>
  );
}

export function MovieSkeleton() {
  return (
    <div className="flex items-center space-x-4 animate-pulse p-6">
      <div className="w-48 h-72 bg-gray-300 rounded"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  );
}

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
            <div
              key={index}
              className="aspect-[2/3] rounded-lg bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
