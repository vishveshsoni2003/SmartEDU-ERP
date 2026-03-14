import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, Home, User, Settings } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Modern Navbar Component
 * Features:
 * - Sticky top navigation
 * - Mobile hamburger menu
 * - Clean typography
 * - Proper spacing and hierarchy
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Unauthenticated user navbar
  if (!user) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:shadow-md transition">
                S
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:block">
                SmartEdu
              </span>
            </Link>

            {/* CTA */}
            <Link to="/login">
              <Button size="md" variant="solid">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Get dashboard route based on role
  const dashboardRoute =
    user.role === 'SUPER_ADMIN'
      ? '/super-admin/dashboard'
      : user.role === 'ADMIN'
      ? '/admin'
      : user.role === 'FACULTY'
      ? '/faculty'
      : user.role === 'STUDENT'
      ? '/student'
      : '/driver';

  const navLinks = [
    { label: 'Dashboard', href: dashboardRoute, icon: Home },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={dashboardRoute} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:shadow-md transition">
              S
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              SmartEdu
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium text-sm transition"
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {user.name || user.email}
            </span>
            <Button
              size="sm"
              variant="ghost"
              color="danger"
              icon={LogOut}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-900" />
            ) : (
              <Menu size={24} className="text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-gray-50 px-4 py-4">
            <div className="space-y-2 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 px-4 mb-3">
                {user.name || user.email}
              </p>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
