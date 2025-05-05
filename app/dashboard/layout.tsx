'use client';

import React from 'react';

/**
 * Minimal Dashboard Layout
 * Provides a basic structure for dashboard routes and prevents inheriting
 * components (like CrispChat, Banners) from the root layout.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Render children directly within a simple container
  // This ensures dashboard pages don't get landing page elements
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* The DashboardProvider and specific page structure (3 panels) will be in page.tsx */}
      {children}
    </div>
  );
} 