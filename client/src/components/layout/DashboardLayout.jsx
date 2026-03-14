import React from 'react';

/**
 * Dashboard Layout Component
 * Two-column layout: Sidebar + Main content
 * Mobile responsive with collapsible sidebar
 */
export default function DashboardLayout({ sidebar, children, topbar = null }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      {sidebar}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar (Optional) */}
        {topbar && (
          <div className="border-b border-slate-200 bg-white bg-opacity-90 backdrop-blur-md shadow-sm">
            {topbar}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
