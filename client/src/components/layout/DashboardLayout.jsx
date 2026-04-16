import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

/**
 * DashboardLayout — Self-contained persistent layout.
 * Automatically injects Sidebar + Navbar from auth context.
 * All protected pages should use this and pass NOTHING for sidebar.
 */
export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Persistent Sidebar */}
      <Sidebar user={user} onLogout={logout} />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Persistent Top Navbar */}
        <div className="shrink-0 z-30">
          <Navbar />
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
