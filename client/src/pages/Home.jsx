import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Layout, Zap, Lock, Blocks, ShieldCheck } from "lucide-react";
import Navbar from "../components/layout/Navbar";

export default function Home() {
  const architectures = [
    {
      icon: <Blocks className="w-5 h-5 text-indigo-500" />,
      title: "Modular Deployment",
      description: "Scale independent routing contexts separating Student, Faculty, and Transport telemetry nodes fluidly."
    },
    {
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      title: "Instant Sync",
      description: "WebSocket interfaces maintain real-time bidirectional states resolving massive concurrent matrices instantly."
    },
    {
      icon: <Lock className="w-5 h-5 text-purple-500" />,
      title: "Tenant Isolation",
      description: "Every deployment bound locally guaranteeing maximum memory containment across multi-tenant bounds flawlessly."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] font-sans text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navbar />

      {/* HERO SECTION - Linear / Vercel Aesthetic */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">

        {/* Background Lights Grid */}
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dvzbsdjoe/image/upload/v1/grid-pattern')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-40 dark:opacity-20 pointer-events-none blur-[120px] bg-gradient-to-b from-blue-500 to-indigo-600 rounded-[100%]"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-wider uppercase border border-blue-200 dark:border-blue-900/50 shadow-sm flex items-center gap-2">
              <Sparkles size={14} /> System 2.0 Operational
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 max-w-5xl mx-auto leading-[0.95]">
            Architecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">Institutional</span> Logic.
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
            Attendax maps comprehensive identity infrastructures integrating students, faculties, transport structures, and high-speed telemetry entirely.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10 flex items-center justify-center gap-2 hover:scale-[1.02]">
              Initialize Portal <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/super-admin/login" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#030712] text-slate-700 dark:text-slate-300 font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Root Access
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Frame Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mt-24 w-full max-w-6xl relative z-10"
        >
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl shadow-indigo-100/50 dark:shadow-indigo-900/20 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl overflow-hidden relative">

            {/* Mock Header */}
            <div className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-3 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-400 dark:bg-rose-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-amber-400 dark:bg-amber-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-400 dark:bg-emerald-500/50"></div>
              </div>
              <div className="flex-1 max-w-sm ml-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1.5 px-4 text-xs font-mono text-slate-400 dark:text-slate-500 flex items-center justify-center shadow-inner">
                attendax.edu/gateway
              </div>
            </div>

            {/* Mock Grids */}
            <div className="flex h-[400px] p-6 gap-6">
              <div className="w-64 space-y-4 hidden md:block">
                <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8"></div>
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-md animate-pulse"></div>)}
              </div>
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex justify-between items-center bg-transparent">
                  <div className="h-10 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                  <div className="h-10 w-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50"></div>)}
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] dark:bg-[size:2rem_2rem] rounded-2xl border border-slate-100 dark:border-slate-800/50"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CORE SPECIFICATIONS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-800/50 relative z-10">
        <div className="mb-16">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Underlying Architecture</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl">
            Engineered strictly resolving scalable multi-tier role deployments mapping rigid variables into flexible user experiences automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {architectures.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-500/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 relative z-10 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed relative z-10 text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#030712] py-12 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-blue-600 dark:text-blue-500" />
          <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">Attendax</span>
        </div>
        <p className="text-slate-400 dark:text-slate-500 font-semibold text-sm">
          &copy; {new Date().getFullYear()} Attendax Networks. Immutable bounds.
        </p>
      </footer>
    </div>
  );
}
