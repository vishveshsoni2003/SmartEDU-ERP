import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import StatCard from "../../components/ui/StatCard.jsx";

import Notices from "../../components/student/Notices.jsx";
import Timetable from "../../components/student/Timetable.jsx";
import AttendanceProgress from "../../components/student/AttendanceProgress.jsx";
import LiveBus from "../../components/student/LiveBus.jsx";
import LiveBusMap from "../../components/student/LiveBusMap.jsx";
import UpcomingHolidays from "../../components/student/UpcomingHolidays.jsx";

import api from "../../services/api";
import { Book, Clock, Bell, AlertCircle, TrendingUp, Calendar, FileText, Home } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [lectureAttendance, setLectureAttendance] = useState(null);
  const [mentorAttendance, setMentorAttendance] = useState(null);
  const [todayLectures, setTodayLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1️⃣ Student profile
        const profileRes = await api.get("/students/me");
        const s = profileRes.data.student;
        setStudent(s);

        // 2️⃣ Attendance
        const [lectureRes, mentorRes] = await Promise.all([
          api.get(`/attendance-percentage/lecture/${s._id}`),
          api.get(`/attendance-percentage/mentor/${s._id}`)
        ]);

        setLectureAttendance(lectureRes.data);
        setMentorAttendance(mentorRes.data);

        // 3️⃣ Today lectures
        const day = new Date()
          .toLocaleString("en-US", { weekday: "long" })
          .toUpperCase();

        const lectureList = await api.get("/lectures", {
          params: {
            courseId: s.courseId._id,
            year: s.year,
            section: s.section
          }
        });

        setTodayLectures(
          lectureList.data.lectures.filter(l => l.day === day)
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) return null;

  const lecturePercentage = lectureAttendance?.percentage || 0;
  const mentorPercentage = mentorAttendance?.percentage || 0;
  const isLowAttendance = lecturePercentage < 75 || mentorPercentage < 75;

  return (
    <DashboardLayout>
      {/* =======================
          HEADER SECTION
      ======================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {student.userId?.name || "Student"}! 👋</h1>
        <p className="text-slate-600 mt-1">Here's your academic overview for today</p>
      </div>

      {/* =======================
          QUICK ACTION BUTTONS
      ======================= */}
      <div className="mb-8 flex flex-wrap gap-3">
        {student.studentType === "HOSTELLER" && (
          <button
            onClick={() => navigate("/student/hostel-leave")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
          >
            <Home className="w-5 h-5" />
            Hostel Leave Request
          </button>
        )}
      </div>

      {/* =======================
          TOP STATS CARDS
      ======================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Lecture Attendance"
          value={`${lecturePercentage}%`}
          icon={TrendingUp}
          trendDirection={lecturePercentage >= 75 ? "up" : "down"}
          trendColor={lecturePercentage >= 75 ? "green" : "red"}
          trend={lecturePercentage >= 75 ? "+2%" : "-5%"}
        />
        <StatCard
          title="Mentor Attendance"
          value={`${mentorPercentage}%`}
          icon={Book}
          trendDirection={mentorPercentage >= 75 ? "up" : "down"}
          trendColor={mentorPercentage >= 75 ? "green" : "red"}
          trend={mentorPercentage >= 75 ? "+1%" : "-3%"}
        />
        <StatCard
          title="Today's Classes"
          value={todayLectures.length}
          icon={Clock}
          description="Scheduled lectures"
        />
        {student.studentType === "BUS_SERVICE" && (
          <StatCard 
            title="Bus Status" 
            value="Live" 
            description="Real-time tracking active"
          />
        )}
      </div>

      {/* =======================
          ALERT SECTION (Low Attendance)
      ======================= */}
      {isLowAttendance && (
        <div className="mb-8 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-orange-900">Attendance Alert</p>
            <p className="text-sm text-orange-800 mt-1">
              Your attendance is below 75%. Maintain regular classes to meet academic requirements.
            </p>
          </div>
        </div>
      )}

      {/* =======================
          QUICK ACTION BUTTONS
      ======================= */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/student/hostel-leave")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
        >
          <Home className="w-5 h-5" />
          Hostel Leave
        </button>
        <button
          onClick={() => navigate("/student/applications")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
        >
          <FileText className="w-5 h-5" />
          My Applications
        </button>
      </div>

      {/* =======================
          MIDDLE SECTION
      ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Attendance Overview</h2>
          <AttendanceProgress
            lecture={lecturePercentage}
            mentor={mentorPercentage}
          />
        </div>

        {student.studentType === "BUS_SERVICE" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Bus Information</h2>
            <LiveBus busId={student.busId} />
          </div>
        )}
      </div>

      {/* =======================
          BOTTOM SECTION
      ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h2 className="text-lg font-bold">Announcements</h2>
            </div>
          </div>
          <div className="p-6">
            <Notices />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <h2 className="text-lg font-bold">Today's Schedule</h2>
            </div>
          </div>
          <div className="p-6">
            <Timetable lectures={todayLectures} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <h2 className="text-lg font-bold">Holidays</h2>
            </div>
          </div>
          <div className="p-6">
            <UpcomingHolidays />
          </div>
        </div>
      </div>

      {/* =======================
          LIVE MAP
      ======================= */}
      {student.studentType === "BUS_SERVICE" && (
        <div className="mt-8">
          <LiveBusMap busId={student.busId} />
        </div>
      )}
    </DashboardLayout>
  );
}
