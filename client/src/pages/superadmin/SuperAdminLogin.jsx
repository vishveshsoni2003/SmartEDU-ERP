import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, LayoutDashboard, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';
import { motion } from 'framer-motion';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Super Admin authentication paths require explicit credential structures.');
        setLoading(false);
        return;
      }

      const response = await API.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });

      const { accessToken, refreshToken, user } = response.data;

      if (accessToken && user) {
        authLogin(user, accessToken, refreshToken);
        navigate('/super-admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Network bounds rejected access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-slate-950 transition-colors duration-300 font-sans">

      {/* LEFT COLUMN - BRANDING (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between overflow-hidden relative bg-slate-950 border-r border-slate-800 p-12">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-black"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white opacity-80 hover:opacity-100 transition">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">Return to Entry</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="bg-indigo-500/20 text-indigo-400 p-4 rounded-2xl w-max mb-6 border border-indigo-500/30">
            <Database className="h-10 w-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Root Super Admin Layer
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            This module possesses explicit architectural override authority tracking global multi-tenant deployments safely.
          </p>
        </motion.div>
      </div>

      {/* RIGHT COLUMN - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden"
        >
          {/* Subtle top active indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

          <div className="text-center mb-8 mt-2">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Root</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Authenticate core network architecture credentials</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-start gap-3 text-sm font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Root Identity</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@attendax.edu"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Root Skeleton Key</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex gap-2 items-center">
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Decrypting...
                </div>
              ) : "Mount Core Architecture"}
            </button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}
