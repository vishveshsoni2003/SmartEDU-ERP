import React from 'react';
import { useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';
import { InsidePersistentLayout } from './PersistentLayout';

/**
 * DashboardLayout — Provides Sidebar + Navbar shell.
 * 
 * When used inside PersistentLayout (via nested routes in App.jsx),
 * it detects the context and renders children directly — avoiding
 * a double shell and preventing sidebar remount on route changes.
 * 
 * When used standalone (legacy or special pages), it renders the full shell.
 */
export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const isInsidePersistent = useContext(InsidePersistentLayout);

  // Already inside PersistentLayout — just render children, no double shell
  if (isInsidePersistent) {
    return <>{children}</>;
  }

  // Standalone usage — render full shell
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      <Sidebar user={user} onLogout={logout} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="shrink-0 z-30">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
