import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PersistentLayout from "./components/layout/PersistentLayout";

import Home from "./pages/Home";

// Reusable Fallback Element — dark mode aware
const GlobalLoader = () => (
  <div className="flex justify-center items-center h-screen w-full bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <p className="text-slate-400 dark:text-slate-500 text-sm font-bold tracking-widest">LOADING</p>
    </div>
  </div>
);

// Lazy Loaded Boundaries
const Login = lazy(() => import("./pages/auth/Login"));
const SuperAdminLogin = lazy(() => import("./pages/superadmin/SuperAdminLogin"));
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/SuperAdminDashboard"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminAttendance = lazy(() => import("./pages/admin/AdminAttendance"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminNotices = lazy(() => import("./pages/admin/AdminNotices"));
const AdminClubs = lazy(() => import("./pages/admin/AdminClubs"));
const AdminFaculty = lazy(() => import("./pages/admin/AdminFaculty"));
const AdminHostels = lazy(() => import("./pages/admin/AdminHostels"));
const AdminTransport = lazy(() => import("./pages/admin/AdminTransport"));

const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentAttendance = lazy(() => import("./pages/student/StudentAttendance"));
const HostelLeaveRequest = lazy(() => import("./pages/student/HostelLeaveRequest"));
const StudentApplications = lazy(() => import("./pages/student/StudentApplications"));

const FacultyDashboard = lazy(() => import("./pages/faculty/FacultyDashboard"));
const FacultyClasses = lazy(() => import("./pages/faculty/FacultyClasses"));
const FacultyAttendance = lazy(() => import("./pages/faculty/FacultyAttendance"));
const FacultyGrades = lazy(() => import("./pages/faculty/FacultyGrades"));
const FacultyTransport = lazy(() => import("./pages/faculty/FacultyTransport"));

const DriverDashboard = lazy(() => import("./pages/driver/DriverDashboard"));
const DriverRoutes = lazy(() => import("./pages/driver/DriverRoutes"));
const DriverHistory = lazy(() => import("./pages/driver/DriverHistory"));

const Settings = lazy(() => import("./pages/Settings"));
const AdminFinance = lazy(() => import("./pages/admin/AdminFinance"));
const AdminLectures = lazy(() => import("./pages/admin/AdminLectures"));
const AdminHolidays = lazy(() => import("./pages/admin/AdminHolidays"));
const StudentFees  = lazy(() => import("./pages/student/StudentFees"));
const StudentBusTracking = lazy(() => import("./pages/student/StudentBusTracking"));

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            {/* Public routes — no layout */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />

            {/* Super Admin — own layout */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute role="SUPER_ADMIN">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* =============================================
                ADMIN — Persistent layout (sidebar stays mounted)
            ============================================= */}
            <Route
              element={
                <ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}>
                  <PersistentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/notices" element={<AdminNotices />} />
              <Route path="/admin/clubs" element={<AdminClubs />} />
              <Route path="/admin/faculty" element={<AdminFaculty />} />
              <Route path="/admin/hostels" element={<AdminHostels />} />
              <Route path="/admin/transport" element={<AdminTransport />} />
              <Route path="/admin/finance"   element={<AdminFinance />} />
              <Route path="/admin/lectures" element={<AdminLectures />} />
              <Route path="/admin/holidays" element={<AdminHolidays />} />
            </Route>

            {/* =============================================
                STUDENT — Persistent layout
            ============================================= */}
            <Route
              element={
                <ProtectedRoute role="STUDENT">
                  <PersistentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/hostel-leave" element={<HostelLeaveRequest />} />
              <Route path="/student/applications" element={<StudentApplications />} />
              <Route path="/student/fees"         element={<StudentFees />} />
              <Route path="/student/bus-tracking" element={<StudentBusTracking />} />
            </Route>

            {/* =============================================
                FACULTY — Persistent layout
            ============================================= */}
            <Route
              element={
                <ProtectedRoute role="FACULTY">
                  <PersistentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/faculty" element={<FacultyDashboard />} />
              <Route path="/faculty/classes" element={<FacultyClasses />} />
              <Route path="/faculty/attendance" element={<FacultyAttendance />} />
              <Route path="/faculty/grades" element={<FacultyGrades />} />
              <Route path="/faculty/transport" element={<FacultyTransport />} />
            </Route>

            {/* =============================================
                DRIVER — Persistent layout
            ============================================= */}
            <Route
              element={
                <ProtectedRoute role="DRIVER">
                  <PersistentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/driver/routes" element={<DriverRoutes />} />
              <Route path="/driver/history" element={<DriverHistory />} />
            </Route>

            {/* =============================================
                SHARED — Settings/Profile (any authenticated user)
            ============================================= */}
            <Route
              element={
                <ProtectedRoute>
                  <PersistentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
