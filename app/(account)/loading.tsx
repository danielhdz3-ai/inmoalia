export default function AccountLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="h-8 w-40 bg-[#e8ddd0] rounded-lg animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl border border-[#e8ddd0] p-6">
          <div className="flex flex-col items-center gap-3 mb-5">
            <div className="w-16 h-16 rounded-full bg-[#e8ddd0] animate-pulse" />
            <div className="h-5 w-28 bg-[#e8ddd0] rounded animate-pulse" />
            <div className="h-4 w-36 bg-[#e8ddd0] rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-9 bg-[#e8ddd0] rounded-lg animate-pulse" />
            <div className="h-9 bg-[#e8ddd0] rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#e8ddd0] p-6">
          <div className="h-6 w-32 bg-[#e8ddd0] rounded animate-pulse mb-5" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#e8ddd0] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
