import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Bus, DollarSign,
  Settings, LogOut, Menu, X, CheckSquare, BarChart3, Database, Frame, Building, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getNavItems = () => {
    const baseItems = [
      { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
      { label: 'Attendance', href: '/student/attendance', icon: Calendar },
    ];

    if (user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN') {
      return [
        { label: 'Dashboard',  href: '/admin',           icon: LayoutDashboard },
        { label: 'Students',   href: '/admin/users',     icon: Users },
        { label: 'Courses',    href: '/admin/courses',   icon: Database },
        { label: 'Faculty',    href: '/admin/faculty',   icon: GraduationCap },
        { label: 'Hostels',    href: '/admin/hostels',   icon: Building },
        { label: 'Transport',  href: '/admin/transport', icon: Bus },
        { label: 'Finance',    href: '/admin/finance',   icon: DollarSign },
        { label: 'Reports',    href: '/admin/reports',   icon: BarChart3 },
      ];
    }

    if (user?.role === 'FACULTY') {
      return [
        { label: 'Dashboard',  href: '/faculty',            icon: LayoutDashboard },
        { label: 'My Classes', href: '/faculty/classes',    icon: Users },
        { label: 'Attendance', href: '/faculty/attendance', icon: CheckSquare },
        { label: 'Grades',     href: '/faculty/grades',     icon: BarChart3 },
        { label: 'Transport',  href: '/faculty/transport',  icon: Bus },
      ];
    }

    if (user?.role === 'DRIVER') {
      return [
        { label: 'Dashboard', href: '/driver',         icon: LayoutDashboard },
        { label: 'My Route',  href: '/driver/routes',  icon: Bus },
        { label: 'History',   href: '/driver/history', icon: Calendar },
      ];
    }

    // STUDENT default
    return [
      { label: 'Dashboard',    href: '/student',              icon: LayoutDashboard },
      { label: 'Attendance',   href: '/student/attendance',   icon: Calendar },
      { label: 'Track My Bus', href: '/student/bus-tracking', icon: Bus },
      { label: 'My Fees',      href: '/student/fees',         icon: DollarSign },
      { label: 'Applications', href: '/student/applications', icon: CheckSquare },
    ];
  };

  const navItems = getNavItems();
  const isActive = (href) => location.pathname === href;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`
          fixed lg:relative left-0 top-0 h-screen
          w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/60
          transform transition-transform duration-300 ease-in-out
          z-40 lg:z-0 lg:translate-x-0 overflow-y-auto flex flex-col shadow-2xl lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header App Logo Brand */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800/80">
          <Link to="/" className="flex items-center gap-3 w-full group">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
              <Frame className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Attendax</h2>
          </Link>
        </div>

        {/* User Context */}
        <div className="px-6 py-8">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shadow-black/20">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || "Institution User"}</p>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate uppercase tracking-widest">{user?.role || "GUEST"}</p>
            </div>
          </div>
        </div>

        <nav className="px-4 flex-1 space-y-1.5 pb-8">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  relative flex items-center gap-3.5 px-4 py-3 rounded-xl
                  transition-all duration-200 font-bold text-sm overflow-hidden group
                  ${active
                    ? 'text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 shadow-[0_2px_10px_-4px_rgba(59,130,246,0.3)]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'
                  }
                `}
              >
                {active && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-md"></motion.div>
                )}
                <item.icon size={20} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors'} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 dark:hover:text-white transition font-bold text-sm mb-1"
          >
            <Settings size={20} className="text-slate-400 dark:text-slate-500" />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => {
              onLogout?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition font-bold text-sm"
          >
            <LogOut size={20} className="text-rose-500 dark:text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
