import { useEffect, useState } from "react";
import { Users, BookOpen, Clock, Bus, FileText, Building2, Navigation, Calendar } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/* =======================
   PEOPLE
======================= */
import CreateStudent from "../../components/admin/CreateStudent";
import StudentList from "../../components/admin/StudentList";
import CreateFaculty from "../../components/admin/CreateFaculty";
import FacultyList from "../../components/admin/FacultyList";

/* =======================
   ACADEMIC SETUP
======================= */
import CreateCourse from "../../components/admin/CreateCourse";
import CourseList from "../../components/admin/CourseList";
import CreateSection from "../../components/admin/CreateSection";
import SectionList from "../../components/admin/SectionList";
import CreateSubject from "../../components/admin/CreateSubject";
import SubjectList from "../../components/admin/SubjectList";

/* =======================
   TIMETABLE
======================= */
import CreateLecture from "../../components/admin/CreateLecture";
import LectureList from "../../components/admin/LectureList";
import AssignMentor from "../../components/admin/AssignMentor";

/* =======================
   OPERATIONS
======================= */
import CreateNotice from "../../components/admin/CreateNotice";
import NoticeList from "../../components/admin/NoticeList";
import CreateHostel from "../../components/admin/CreateHostel";
import HostelList from "../../components/admin/HostelList";
import CreateRoute from "../../components/admin/CreateRoute";
import ManageRoutes from "../../components/admin/ManageRoutes";
import CreateBus from "../../components/admin/CreateBus";
import ManageBuses from "../../components/admin/ManageBuses";

/* =======================
   CALENDAR
======================= */
import CreateHoliday from "../../components/admin/CreateHoliday";
import HolidayList from "../../components/admin/HolidayList";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
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
    api.get("/admin/stats").then(res => setStats(res.data));
  }, []);

  return (
    <>
      <Navbar />
      <DashboardLayout sidebar={<Sidebar user={user} onLogout={logout} />}>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your institution's academic and operational systems</p>
          </div>

          {/* =======================
              OVERVIEW STATS
          ======================= */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Students" 
                value={stats.students || 0}
                icon={Users}
                description="Active students"
              />
              <StatCard 
                title="Faculty Members" 
                value={stats.faculty || 0}
                icon={Users}
                description="Active faculty"
              />
              <StatCard 
                title="Courses" 
                value={stats.courses || 0}
                icon={BookOpen}
                description="Total courses"
              />
              <StatCard 
                title="Transport Fleet" 
                value={stats.buses || 0}
                icon={Bus}
                description="Buses available"
              />
            </div>
          </section>

          {/* =======================
              ACADEMIC SETUP
          ======================= */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={28} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Academic Setup</h2>
            </div>

            <div className="space-y-8">
              {/* Courses */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Courses</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CreateCourse onCreated={() => setCourseListKey(prev => prev + 1)} />
                  <CourseList key={courseListKey} />
                </div>
              </Card>

              {/* Sections */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Sections</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CreateSection onCreated={() => setSectionListKey(prev => prev + 1)} />
                  <SectionList key={sectionListKey} />
                </div>
              </Card>

              {/* Subjects */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Subjects</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CreateSubject onCreated={() => setSubjectListKey(prev => prev + 1)} />
                  <SubjectList key={subjectListKey} />
                </div>
              </Card>
            </div>
          </section>

          {/* =======================
              PEOPLE MANAGEMENT
          ======================= */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Users size={28} className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">People Management</h2>
            </div>

            <div className="space-y-8">
              {/* Students */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Students</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CreateStudent onCreated={() => setStudentListKey(prev => prev + 1)} />
                  <StudentList key={studentListKey} />
                </div>
              </Card>

              {/* Faculty */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Faculty</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CreateFaculty onCreated={() => setFacultyListKey(prev => prev + 1)} />
                  <FacultyList key={facultyListKey} />
                </div>
              </Card>
            </div>
          </section>

          {/* =======================
              TIMETABLE & MENTOR
          ======================= */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Clock size={28} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Timetable & Mentors</h2>
            </div>

            <div className="space-y-8">
              {/* Lectures */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Lectures</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CreateLecture onCreated={() => setLectureListKey(prev => prev + 1)} />
                  <LectureList key={lectureListKey} />
                </div>
              </Card>

              {/* Mentors */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Assign Mentors</h3>
                <AssignMentor />
              </Card>
            </div>
          </section>

          {/* =======================
              OPERATIONS
          ======================= */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText size={28} className="text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Operations</h2>
            </div>

            <div className="space-y-8">
              {/* Notices */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Notices</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CreateNotice onCreated={() => setNoticeListKey(prev => prev + 1)} />
                  <NoticeList key={noticeListKey} />
                </div>
              </Card>

              {/* Hostels */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Hostels</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CreateHostel onCreated={() => setHostelListKey(prev => prev + 1)} />
                  <HostelList key={hostelListKey} />
                </div>
              </Card>

              {/* Routes */}
              <Card shadow="md" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Routes & Buses</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CreateRoute onCreated={() => {}} />
                  <div className="space-y-6">
                    <ManageRoutes />
                    <ManageBuses />
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* =======================
              ACADEMIC CALENDAR
          ======================= */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Calendar size={28} className="text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Academic Calendar</h2>
            </div>

            <Card shadow="md" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Holidays</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CreateHoliday onCreated={() => setHolidayListKey(prev => prev + 1)} />
                <HolidayList key={holidayListKey} />
              </div>
            </Card>
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}
