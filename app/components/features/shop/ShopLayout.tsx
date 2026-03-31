import React from 'react';
import { cn } from "@/lib/utils/tailwind";

interface ShopLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function ShopLayout({ children, sidebar, className }: ShopLayoutProps) {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      <div className="flex gap-8">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden lg:block w-60 shrink-0">
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
