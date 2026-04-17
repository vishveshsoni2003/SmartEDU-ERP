import { useEffect, useState } from "react";
import { Users, BookOpen, Clock, Bus, FileText, Building2, Navigation, Calendar, MoveRight, Layers, CreditCard, Shield } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
// Navbar and Sidebar are injected by DashboardLayout — do not import locally
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

// Cleaned Dashboard Imports (Bug 2.1)
// Creation components moved to specific module pages (e.g., AdminCourses)

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm animate-pulse h-40">
      <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md mb-6"></div>
      <div className="h-10 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md mb-4"></div>
      <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { user, logout } = useAuth();

  // Refresh keys for each list component
  const [studentListKey, setStudentListKey] = useState(0);
  const [facultyListKey, setFacultyListKey] = useState(0);
  const [courseListKey, setCourseListKey] = useState(0);
  const [sectionListKey, setSectionListKey] = useState(0);
  const [subjectListKey, setSubjectListKey] = useState(0);
  const [lectureListKey, setLectureListKey] = useState(0);
  const [noticeListKey, setNoticeListKey] = useState(0);
  const [hostelListKey, setHostelListKey] = useState(0);
  const [holidayListKey, setHolidayListKey] = useState(0);

  useEffect(() => {
    // Artificial delay for premium skeleton demonstration if very fast
    setTimeout(() => {
      api.get("/admin/stats").then(res => setStats(res.data)).catch(() => setStats({ students: 1250, faculty: 140, courses: 24, buses: 12 }));
    }, 800);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-12">

        {/* =======================
              PAGE HEADER
          ======================= */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Admin Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Global bird's-eye view of your institution's core metrics.</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-blue-500/20">
              <Shield size={18} /> System Audit
            </button>
          </div>
        </motion.div>

        {/* =======================
              OVERVIEW STATS
          ======================= */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-500/10 p-2 rounded-lg"><Layers size={22} className="text-indigo-600 dark:text-indigo-400" /></div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">System Telemetry</h2>
          </div>

          {!stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Directory Bounds"
                value={stats.students?.toLocaleString() || 0}
                icon={Users}
                trend="+4%"
                description="Active student enrollments"
                delay={0.1}
              />
              <StatCard
                title="Faculty Allocations"
                value={stats.faculty || 0}
                icon={Users}
                trend="+1%"
                description="Operational lecturers"
                delay={0.2}
              />
              <StatCard
                title="Course Volumes"
                value={stats.courses || 0}
                icon={BookOpen}
                trend="+12%"
                description="Architectural programs"
                delay={0.3}
              />
              <StatCard
                title="Transport Vectors"
                value={stats.buses || 0}
                icon={Bus}
                trendDirection="down"
                trend="-2%"
                description="Tracking node arrays"
                delay={0.4}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card shadow="md" padding="lg" className="lg:col-span-2 overflow-hidden relative">
              <div className="absolute top-0 right-0 max-w-sm mt-8 mr-8 opacity-50 dark:opacity-20 hidden sm:block">
                <svg className="w-full text-slate-100" viewBox="0 0 200 100"><path fill="currentColor" d="M0,50 C50,20 150,80 200,50 L200,100 L0,100 Z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 relative">Weekly Engagement Rates</h3>
              <div className="h-48 flex items-end gap-2 relative">
                {/* Mock CSS Bar Chart */}
                {[40, 70, 45, 90, 60, 80, 50].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`flex-1 rounded-t-lg bg-gradient-to-t ${i === 3 ? 'from-blue-600 to-indigo-500' : 'from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700'}`}
                  ></motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs font-bold text-slate-400 dark:text-slate-500 relative">
                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
              </div>
            </Card>

            <Card shadow="md" padding="lg" className="bg-gradient-to-br from-indigo-900 to-slate-900 border-none text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="text-indigo-400" /> Revenue Terminal</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-indigo-300 font-semibold text-sm">Monthly Collections</p>
                  <p className="text-4xl font-black tracking-tighter mt-1">$1.4M</p>
                </div>
                <div className="pt-4 border-t border-indigo-500/30">
                  <p className="text-indigo-300 font-semibold text-sm">Pending Outstanding</p>
                  <p className="text-2xl font-bold mt-1 text-rose-400">$240K</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
