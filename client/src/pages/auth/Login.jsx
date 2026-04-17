import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';
import { motion } from 'framer-motion';

export default function Login() {
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
        setError('Both email and password are explicitly required.');
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

        let redirectPath = '/login';
        const role = user.role?.toUpperCase().trim();

        if (role === 'SUPER_ADMIN') {
          redirectPath = '/super-admin/dashboard';
        } else if (role === 'ADMIN' || role === 'SUB_ADMIN') {
          redirectPath = '/admin';
        } else if (role === 'STUDENT') {
          redirectPath = '/student';
        } else if (role === 'FACULTY') {
          redirectPath = '/faculty';
        } else if (role === 'DRIVER') {
          redirectPath = '/driver';
        }

        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication structurally failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-slate-950 transition-colors duration-300 font-sans">

      {/* LEFT COLUMN - BRANDING (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between overflow-hidden relative bg-slate-900 border-r border-slate-800 p-12">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
        <div className="absolute -left-10 -bottom-10 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full mix-blend-screen mix-blend-lighten pointer-events-none"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white">
            <LayoutDashboard className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold tracking-tight">Attendax</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <h2 className="text-5xl font-extrabold text-white mb-6 leading-[1.1]">
            Unifying Campus Architecture.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Access secure telemetry feeds, structural multi-tenant environments, and real-time backend updates instantly through standard authentication bounds.
          </p>
          <div className="flex items-center gap-3 text-sm font-semibold text-blue-400 bg-blue-500/10 w-max px-4 py-2 rounded-full border border-blue-500/20">
            <ShieldCheck className="h-4 w-4" /> Secure JWT Encryption Active
          </div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800"
        >

          <div className="text-center mb-8">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Access Portal</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Enter your designated institution credentials</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-start gap-3 text-sm font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Interface</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@attendax.edu"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Secure Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
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
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex gap-2 items-center">
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Verifying...
                </div>
              ) : "Authenticate Session"}
            </button>
          </form>

        </motion.div>

        {/* Mobile footer fallback */}
        <div className="mt-8 text-center sm:hidden text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Attendax
        </div>
      </div>
    </div>
  );
}