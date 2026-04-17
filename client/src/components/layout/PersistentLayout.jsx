import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

// Context so DashboardLayout knows it's already inside a persistent shell
export const InsidePersistentLayout = createContext(false);

/**
 * PersistentLayout — React Router layout route wrapper.
 * Sidebar + Navbar mount ONCE and persist across all child route navigations.
 * DashboardLayout detects this context and skips re-rendering the shell.
 */
export default function PersistentLayout() {
  const { user, logout } = useAuth();

  return (
    <InsidePersistentLayout.Provider value={true}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
        {/* Sidebar — mounts once, never remounts on route change */}
        <Sidebar user={user} onLogout={logout} />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="shrink-0 z-30">
            <Navbar />
          </div>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Outlet renders the matched child route */}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </InsidePersistentLayout.Provider>
  );
}
