import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bus,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

/**
 * Modern Sidebar Component
 * Features:
 * - Collapsible on mobile
 * - Active link highlighting
 * - Icon + text navigation
 */
export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
      { label: 'Attendance', href: '/student/attendance', icon: Calendar },
    ];

    if (user?.role === 'ADMIN') {
      return [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Courses', href: '/admin/courses', icon: Calendar },
        { label: 'Attendance', href: '/admin/attendance', icon: Calendar },
        { label: 'Reports', href: '/admin/reports', icon: DollarSign },
      ];
    }

    if (user?.role === 'FACULTY') {
      return [
        { label: 'Dashboard', href: '/faculty', icon: LayoutDashboard },
        { label: 'My Classes', href: '/faculty/classes', icon: Users },
        { label: 'Attendance', href: '/faculty/attendance', icon: Calendar },
        { label: 'Grades', href: '/faculty/grades', icon: DollarSign },
      ];
    }

    if (user?.role === 'DRIVER') {
      return [
        { label: 'Dashboard', href: '/driver', icon: LayoutDashboard },
        { label: 'Routes', href: '/driver/routes', icon: Bus },
        { label: 'History', href: '/driver/history', icon: Calendar },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative left-0 top-16 lg:top-0 h-screen lg:h-auto
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          z-30 lg:z-0
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo on Mobile */}
        <div className="lg:hidden h-16 flex items-center px-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Menu</h2>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2 lg:py-8 lg:px-6">
          {navItems.map((item) => (
            <div key={item.href}>
              <Link
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-all duration-200 font-medium text-sm
                  ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            </div>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Settings & Logout */}
        <nav className="px-4 py-4 lg:px-6 space-y-2">
          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium text-sm"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>

          <button
            onClick={() => {
              onLogout?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
