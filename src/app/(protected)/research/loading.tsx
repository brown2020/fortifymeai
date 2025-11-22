export default function ResearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mr-3"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Search Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>

            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>
          </div>

          {/* Search History Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mr-2"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-2">
                    <div className="h-5 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
