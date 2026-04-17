import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import FacultyTimetable from "../../components/faculty/FacultyTimetable";
import HostelApprovals from "../../components/faculty/HostelApprovals";
import WardenApplications from "../../components/faculty/WardenApplications";
import FacultyNotices from "../../components/faculty/FacultyNotices";
import CreateNotice from "../../components/faculty/CreateNotice";
import MentorAttendance from "../../components/faculty/MentorAttendance";
import UpcomingHolidays from "../../components/student/UpcomingHolidays";
import toast from "react-hot-toast";

import api from "../../services/api";
import { Clock, CheckCircle, Users, Bell, BookOpen, Award, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [facultyAttendance, setFacultyAttendance] = useState(null);
  const [noticesKey, setNoticesKey] = useState(0);

  useEffect(() => {
    api.get("/faculty-attendance/percentage").then(res => setFacultyAttendance(res.data)).catch(() => { });
    api.get("/faculty/dashboard").then(res => setData(res.data)).catch(() => { });
  }, []);

  if (!data) return (
    <DashboardLayout>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl h-40"></div>)}
      </div>
    </DashboardLayout>
  );

  const attendancePercentage = facultyAttendance?.percentage || 0;
  // Safe defaults — API may not return all fields
  const facultyType = data.facultyType || [];
  const todayLectures = data.todayLectures || [];

  return (
    <DashboardLayout>
      <div className="space-y-10">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Authority Terminal</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Control module layouts, evaluate matrices, and dispatch alerts natively.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={async () => {
              try {
                await api.post("/faculty-attendance/mark");
                toast.success("Presence recorded successfully");
              } catch (err) {
                toast.error(err.response?.data?.message || "Failed to record presence");
              }
            }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-emerald-500/20">
              <CheckCircle size={18} /> Signal Presence Array
            </button>
          </div>
        </motion.div>

        {data.isMentor && data.mentorDetails && (
          <div className="bg-indigo-600/10 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-400 tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" /> Authorized Mentor Oversight
                </h3>
                <p className="text-indigo-700 dark:text-indigo-300 mt-2 font-medium">
                  Course Bounds: <span className="font-bold text-slate-900 dark:text-white px-2 py-1 bg-white/50 dark:bg-slate-900/50 rounded mx-1">{data.mentorDetails.course?.name || "Unknown"}</span>
                  Sem: <span className="font-bold px-1">{data.mentorDetails.semester}</span> |
                  Sec: <span className="font-bold px-1">{data.mentorDetails.section}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Active Protocols" value={todayLectures.length} icon={Clock} delay={0.1} />
          <StatCard title="Integrity Match" value={`${attendancePercentage}%`} icon={CheckCircle} trendDirection={attendancePercentage >= 80 ? "up" : "down"} delay={0.2} />
          <StatCard title="Dispatched Signals" value={data.noticesCount || 0} icon={Bell} delay={0.3} />
          {data.isMentor && <StatCard title="Directive" value="Mentor" icon={Users} delay={0.4} />}
          {facultyType.includes("WARDEN") && <StatCard title="Quarantine Leaves" value={data.pendingLeaves || 0} icon={Award} delay={0.5} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card shadow="md" padding="none" className="overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600/90 to-blue-700/90 dark:from-blue-600/40 dark:to-blue-700/40 text-white border-b border-blue-500/30">
              <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-100 dark:text-blue-400" /><h2 className="text-lg font-bold">Schedule Map</h2></div>
            </div>
            <div className="p-6"><FacultyTimetable lectures={todayLectures} /></div>
          </Card>

          {facultyType.includes("WARDEN") && (
            <Card shadow="md" padding="none" className="overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-orange-600/90 to-orange-700/90 dark:from-orange-600/40 dark:to-orange-700/40 text-white border-b border-orange-500/30">
                <div className="flex items-center gap-3"><Award className="w-5 h-5 text-orange-100 dark:text-orange-400" /><h2 className="text-lg font-bold">Hostel Control</h2></div>
              </div>
              <div className="p-6"><HostelApprovals /></div>
            </Card>
          )}
        </div>

        <Card shadow="md" padding="none" className="overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-teal-600/90 to-teal-700/90 dark:from-teal-600/40 dark:to-teal-700/40 text-white border-b border-teal-500/30">
            <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-teal-100 dark:text-teal-400" /><h2 className="text-lg font-bold">Action Queue</h2></div>
          </div>
          <div className="p-6"><WardenApplications /></div>
        </Card>

        {data.isMentor && data.mentorDetails && (
          <Card shadow="md" padding="none" className="overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600/90 to-purple-700/90 dark:from-purple-600/40 dark:to-purple-700/40 text-white border-b border-purple-500/30">
              <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-purple-100 dark:text-purple-400" /><h2 className="text-lg font-bold">Record Mentorship Matrix</h2></div>
            </div>
            <div className="p-6"><MentorAttendance mentorDetails={data.mentorDetails} /></div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card shadow="md" padding="none" className="overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-pink-600/90 to-pink-700/90 dark:from-pink-600/40 dark:to-pink-700/40 text-white border-b border-pink-500/30">
              <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-pink-100 dark:text-pink-400" /><h2 className="text-lg font-bold">Trigger Network Broadcast</h2></div>
            </div>
            <div className="p-6"><CreateNotice onCreated={() => setNoticesKey(prev => prev + 1)} /></div>
          </Card>

          <Card shadow="md" padding="none" className="overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-600/90 to-indigo-700/90 dark:from-indigo-600/40 dark:to-indigo-700/40 text-white border-b border-indigo-500/30">
              <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-indigo-100 dark:text-indigo-400" /><h2 className="text-lg font-bold">Transmitted Signals</h2></div>
            </div>
            <div className="p-6"><FacultyNotices key={noticesKey} /></div>
          </Card>

          <Card shadow="md" padding="none" className="overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-rose-600/90 to-orange-600/90 dark:from-rose-600/40 dark:to-orange-600/40 text-white border-b border-rose-500/30">
              <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-rose-100 dark:text-rose-400" /><h2 className="text-lg font-bold">Structural Suspensions</h2></div>
            </div>
            <div className="p-6"><UpcomingHolidays /></div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
