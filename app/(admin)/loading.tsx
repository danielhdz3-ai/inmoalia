export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="h-8 w-64 bg-[#e8ddd0] rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-48 bg-[#e8ddd0] rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e8ddd0] p-5">
            <div className="w-10 h-10 bg-[#e8ddd0] rounded-xl animate-pulse mb-3" />
            <div className="h-7 w-16 bg-[#e8ddd0] rounded animate-pulse mb-1" />
            <div className="h-3 w-24 bg-[#e8ddd0] rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8ddd0]">
          <div className="h-5 w-32 bg-[#e8ddd0] rounded animate-pulse" />
        </div>
        <div className="divide-y divide-[#e8ddd0]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3">
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-[#e8ddd0] rounded animate-pulse" />
                <div className="h-3 w-48 bg-[#e8ddd0] rounded animate-pulse" />
              </div>
              <div className="space-y-1.5 text-right">
                <div className="h-4 w-20 bg-[#e8ddd0] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[#e8ddd0] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
