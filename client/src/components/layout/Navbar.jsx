import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X, LogOut, Home, User, Sun, Moon, Layout } from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardRoute = user ? (
    user.role === 'SUPER_ADMIN' ? '/super-admin/dashboard'
      : user.role === 'ADMIN' ? '/admin'
        : user.role === 'FACULTY' ? '/faculty'
          : user.role === 'STUDENT' ? '/student'
            : '/driver'
  ) : '/';

  const navLinks = user ? [
    { label: 'Dashboard', href: dashboardRoute, icon: Home },
    { label: 'Profile', href: '/profile', icon: User },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO & BRANDING */}
          <Link to={dashboardRoute} className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-105">
              <Layout className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Attendax
              </span>
              {user?.institutionId?.name && (
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mt-1">
                  {user.institutionId.name}
                </span>
              )}
            </div>
          </Link>

          {/* DESKTOP INTEGRATION */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <link.icon size={16} className="opacity-70" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* CONTROLS */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-amber-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-all"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.name || user.email}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.role.replace("_", " ")}</p>
                </div>
                <button onClick={handleLogout} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="md" variant="solid" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-6 font-bold rounded-xl shadow-lg">
                  Launch Interface
                </Button>
              </Link>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 bg-white dark:bg-[#030712] border-b border-slate-200 dark:border-slate-800 p-4 shadow-2xl z-50">
            <div className="flex justify-start mb-6">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl w-full justify-center"
              >
                {theme === 'dark' ? <><Sun size={18} className="text-amber-400" /> Light System</> : <><Moon size={18} /> Dark Architecture</>}
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 dark:text-slate-300 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={18} className="opacity-70" />
                  {link.label}
                </Link>
              ))}
            </div>

            {user && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-4">
                <div className="px-4 mb-4">
                  <p className="text-slate-900 dark:text-white font-black text-lg">{user.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{user.role.replace("_", " ")}</p>
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 font-bold rounded-xl transition"
                >
                  <LogOut size={18} /> Disconnect Vector
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
