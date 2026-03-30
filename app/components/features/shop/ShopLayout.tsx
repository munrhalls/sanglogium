import React from 'react';
import { cn } from "@/lib/utils/tailwind";

interface ShopLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ShopLayout({ children, className }: ShopLayoutProps) {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      <div className="flex gap-8">
        {/* Sidebar — placeholder for filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          {/* Future: FilterSidebar will go here */}
          <div className="h-96 bg-gray-100 rounded" aria-label="Filters placeholder" />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
