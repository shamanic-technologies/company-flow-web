import { Skeleton } from "@/components/ui/skeleton"

export function DashboardShellSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col">
      {/* Navbar Skeleton */}
      <div className="h-12 border-b px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-64 border-r p-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="flex-1 p-6">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}

export function AgentsSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      {/* Skeleton for DataTable */}
      <div className="border rounded-md">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="p-4 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
} 