import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to render loading/error/empty states for sidebar sections
export const renderSectionContent = (
  isLoading: boolean,
  error: string | null,
  items: any[],
  emptyMessage: string,
  renderItem: (item: any, index: number) => React.ReactNode
) => {
  if (isLoading) {
    return (
      <div className="p-2 flex flex-col gap-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    )
  }
  if (error) {
    return <div className="p-2 text-xs text-red-400">Error: {error}</div>
  }
  if (items.length === 0) {
    return <div className="p-2 text-xs text-muted-foreground">{emptyMessage}</div>
  }
  return items.map(renderItem)
} 