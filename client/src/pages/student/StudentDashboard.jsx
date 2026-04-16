import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import Card from "../../components/ui/Card.jsx";
import { motion } from "framer-motion";

import Notices from "../../components/student/Notices.jsx";
import Timetable from "../../components/student/Timetable.jsx";
import AttendanceProgress from "../../components/student/AttendanceProgress.jsx";
import LiveBus from "../../components/student/LiveBus.jsx";
import LiveBusMap from "../../components/student/LiveBusMap.jsx";
import UpcomingHolidays from "../../components/student/UpcomingHolidays.jsx";

import api from "../../services/api";
import { Book, Clock, Bell, AlertCircle, TrendingUp, Calendar, FileText, Home, Navigation } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [lectureAttendance, setLectureAttendance] = useState(null);
  const [mentorAttendance, setMentorAttendance] = useState(null);
  const [todayLectures, setTodayLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const profileRes = await api.get("/students/me");
        const s = profileRes.data.student;
        setStudent(s);

        const [lectureRes, mentorRes] = await Promise.all([
          api.get(`/attendance-percentage/lecture/${s._id}`),
          api.get(`/attendance-percentage/mentor/${s._id}`)
        ]);
        setLectureAttendance(lectureRes.data);
        setMentorAttendance(mentorRes.data);

        const day = new Date().toLocaleString("en-US", { weekday: "long" }).toUpperCase();
        const lectureList = await api.get("/lectures", { params: { courseId: s.courseId._id, year: s.year, section: s.section } });
        setTodayLectures(lectureList.data.lectures.filter(l => l.day === day));
      } catch (err) {
        // silently fail for empty state render
      } finally {
        setTimeout(() => setLoading(false), 800); // UI premium feel
      }
    };
    loadDashboard();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl h-40"></div>)}
      </div>
    </DashboardLayout>
  );

  if (!student) return null;

  const lecturePercentage = lectureAttendance?.percentage || 0;
  const mentorPercentage = mentorAttendance?.percentage || 0;

  return (
    <DashboardLayout>
      <div className="space-y-10">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Access Terminal</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Welcome back, {student.userId?.name || "Student"}! Manage your academic footprint.</p>
          </div>

          <div className="flex gap-3">
            {student.studentType === "HOSTELLER" && (
              <button onClick={() => navigate("/student/hostel-leave")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-indigo-500/20">
                <Home size={18} /> Request Leave
              </button>
            )}
            <button onClick={() => navigate("/student/applications")} className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-slate-900/20">
              <FileText size={18} /> Dispatches
            </button>
          </div>
        </motion.div>

        {(lecturePercentage < 75 || mentorPercentage < 75) && (
          <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-400">Critical Attendance Alert</p>
              <p className="text-sm font-medium text-rose-800 dark:text-rose-300 mt-1">Your registry is falling below operational thresholds (&lt; 75%).</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Lecture Index" value={`${lecturePercentage}%`} icon={TrendingUp} trendDirection={lecturePercentage >= 75 ? "up" : "down"} trend={lecturePercentage >= 75 ? "+2%" : "-5%"} delay={0.1} />
          <StatCard title="Mentor Subnets" value={`${mentorPercentage}%`} icon={Book} trendDirection={mentorPercentage >= 75 ? "up" : "down"} trend={mentorPercentage >= 75 ? "+1%" : "-3%"} delay={0.2} />
          <StatCard title="Today's Classes" value={todayLectures.length} icon={Clock} description="Awaiting engagement" delay={0.3} />
          {student.studentType === "BUS_SERVICE" && <StatCard title="Uplink" value="Live" icon={Navigation} description="Tracking active vector coordinates" delay={0.4} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card shadow="md" padding="lg">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Attendance Overview</h2>
            <AttendanceProgress lecture={lecturePercentage} mentor={mentorPercentage} />
          </Card>

          {student.studentType === "BUS_SERVICE" && (
            <Card shadow="md" padding="lg">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Convoy Vector Status</h2>
              <LiveBus busId={student.busId} />
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card shadow="md" padding="none" className="overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600/90 to-blue-700/90 dark:from-blue-600/40 dark:to-blue-700/40 text-white border-b border-blue-500/30">
              <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-blue-100 dark:text-blue-400" /><h2 className="text-lg font-bold">Network Broadcasts</h2></div>
            </div>
            <div className="p-6"><Notices /></div>
          </Card>

          <Card shadow="md" padding="none" className="overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600/90 to-purple-700/90 dark:from-purple-600/40 dark:to-purple-700/40 text-white border-b border-purple-500/30">
              <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-purple-100 dark:text-purple-400" /><h2 className="text-lg font-bold">Schedule Matrices</h2></div>
            </div>
            <div className="p-6"><Timetable lectures={todayLectures} /></div>
          </Card>

          <Card shadow="md" padding="none" className="overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-rose-600/90 to-orange-600/90 dark:from-rose-600/40 dark:to-orange-600/40 text-white border-b border-orange-500/30">
              <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-orange-100 dark:text-orange-400" /><h2 className="text-lg font-bold">Calendar Suspensions</h2></div>
            </div>
            <div className="p-6"><UpcomingHolidays /></div>
          </Card>
        </div>

        {student.studentType === "BUS_SERVICE" && (
          <div className="pt-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Real-time Telemetry Overlay</h2>
            <LiveBusMap busId={student.busId} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
