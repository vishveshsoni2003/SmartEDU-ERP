import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import FacultyTimetable from "../../components/faculty/FacultyTimetable";
import HostelApprovals from "../../components/faculty/HostelApprovals";
import WardenApplications from "../../components/faculty/WardenApplications";
import FacultyNotices from "../../components/faculty/FacultyNotices";
import CreateNotice from "../../components/faculty/CreateNotice";
import MentorAttendance from "../../components/faculty/MentorAttendance";
import UpcomingHolidays from "../../components/student/UpcomingHolidays";

import api from "../../services/api";
import { Clock, CheckCircle, Users, Bell, BookOpen, Award, Calendar } from "lucide-react";


export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [facultyAttendance, setFacultyAttendance] = useState(null);
  const [noticesKey, setNoticesKey] = useState(0);

  useEffect(() => {
    api.get("/faculty-attendance/percentage")
      .then(res => setFacultyAttendance(res.data));
  }, []);

  useEffect(() => {
    api
      .get("/faculty/dashboard")
      .then(res => {
        console.log("Faculty dashboard data:", res.data);
        setData(res.data);
      })
      .catch(err => {
        console.error("Faculty dashboard error:", err);
      });
  }, []);


  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const attendancePercentage = facultyAttendance?.percentage || 0;

  return (
    <DashboardLayout>
      {/* =======================
          HEADER SECTION
      ======================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard 📚</h1>
        <p className="text-slate-600 mt-1">Manage your lectures, notices, and student attendance</p>
      </div>

      {/* =======================
          TOP STATS CARDS
      ======================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Today's Lectures"
          value={data.todayLectures.length}
          icon={Clock}
          description="Scheduled lectures"
        />

        <StatCard
          title="My Attendance"
          value={`${attendancePercentage}%`}
          icon={CheckCircle}
          trendDirection={attendancePercentage >= 80 ? "up" : "down"}
          trendColor={attendancePercentage >= 80 ? "green" : "red"}
        />

        <StatCard
          title="Notices"
          value={data.noticesCount}
          icon={Bell}
          description="Posted announcements"
        />

        {data.isMentor && (
          <StatCard
            title="Role"
            value="Mentor"
            icon={Users}
            description="Class mentor"
          />
        )}

        {data.facultyType.includes("WARDEN") && (
          <StatCard
            title="Pending Leaves"
            value={data.pendingLeaves}
            icon={Award}
            description="Hostel requests"
          />
        )}
      </div>

      {/* =======================
          QUICK ACTION BUTTONS
      ======================= */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={async () => {
            await api.post("/faculty-attendance/mark");
            alert("✓ Your attendance has been marked for today!");
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
        >
          <CheckCircle className="w-5 h-5" />
          Mark Today Present
        </button>
      </div>

      {/* =======================
          MENTOR CLASS CARD (if applicable)
      ======================= */}
      {data.isMentor && data.mentorDetails && (
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Mentor Class
              </h3>
              <p className="text-indigo-100 mt-2 text-sm">
                <span className="font-semibold">{data.mentorDetails.course?.name}</span>
                {" • Year "}<span className="font-semibold">{data.mentorDetails.year}</span>
                {" • Semester "}<span className="font-semibold">{data.mentorDetails.semester}</span>
                {" • Section "}<span className="font-semibold">{data.mentorDetails.section}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =======================
          MAIN CONTENT GRID
      ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <h2 className="text-lg font-bold">Today's Schedule</h2>
            </div>
          </div>
          <div className="p-6">
            <FacultyTimetable lectures={data.todayLectures} />
          </div>
        </div>

        {/* Hostel Approvals */}
        {data.facultyType.includes("WARDEN") && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <h2 className="text-lg font-bold">Hostel Approvals</h2>
              </div>
            </div>
            <div className="p-6">
              <HostelApprovals />
            </div>
          </div>
        )}
      </div>

      {/* =======================
          STUDENT APPLICATIONS
      ======================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <h2 className="text-lg font-bold">Applications & Requests</h2>
          </div>
        </div>
        <div className="p-6">
          <WardenApplications />
        </div>
      </div>

      {/* =======================
          MENTOR ATTENDANCE & NOTICES
      ======================= */}
      <div className="space-y-8">
        {/* Mentor Attendance Section */}
        {data.isMentor && data.mentorDetails && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <h2 className="text-lg font-bold">Mark Attendance</h2>
              </div>
            </div>
            <div className="p-6">
              <MentorAttendance mentorDetails={data.mentorDetails} />
            </div>
          </div>
        )}

        {/* Notices Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h2 className="text-lg font-bold">Create Announcement</h2>
              </div>
            </div>
            <div className="p-6">
              <CreateNotice onCreated={() => setNoticesKey(prev => prev + 1)} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-lg font-bold">My Announcements</h2>
              </div>
            </div>
            <div className="p-6">
              <FacultyNotices key={noticesKey} />
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
      </div>
    </DashboardLayout>
  );
}
