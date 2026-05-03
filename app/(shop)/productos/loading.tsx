export default function ProductosLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="h-8 w-48 bg-[#e8ddd0] rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-32 bg-[#e8ddd0] rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
            <div className="aspect-square bg-[#e8ddd0] animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-16 bg-[#e8ddd0] rounded animate-pulse" />
              <div className="h-4 w-full bg-[#e8ddd0] rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-[#e8ddd0] rounded animate-pulse" />
              <div className="h-5 w-20 bg-[#e8ddd0] rounded animate-pulse mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
