import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";

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

// Lazy Loaded Boundaries (Drastically reduces Initial Bundle Size)
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

const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentAttendance = lazy(() => import("./pages/student/StudentAttendance"));
const HostelLeaveRequest = lazy(() => import("./pages/student/HostelLeaveRequest"));
const StudentApplications = lazy(() => import("./pages/student/StudentApplications"));

const FacultyDashboard = lazy(() => import("./pages/faculty/FacultyDashboard"));
const FacultyClasses = lazy(() => import("./pages/faculty/FacultyClasses"));
const FacultyAttendance = lazy(() => import("./pages/faculty/FacultyAttendance"));
const FacultyGrades = lazy(() => import("./pages/faculty/FacultyGrades"));

const DriverDashboard = lazy(() => import("./pages/driver/DriverDashboard"));
const DriverRoutes = lazy(() => import("./pages/driver/DriverRoutes"));
const DriverHistory = lazy(() => import("./pages/driver/DriverHistory"));

const Settings = lazy(() => import("./pages/Settings"));
const AdminBulkImport = lazy(() => import("./pages/admin/AdminUsers")); // BulkImport is accessible via AdminUsers


function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />

            <Route path="/super-admin/dashboard" element={<ProtectedRoute role="SUPER_ADMIN"><SuperAdminDashboard /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/notices" element={<ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}><AdminNotices /></ProtectedRoute>} />
            <Route path="/admin/clubs" element={<ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}><AdminClubs /></ProtectedRoute>} />

            <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute role="STUDENT"><StudentAttendance /></ProtectedRoute>} />
            <Route path="/student/hostel-leave" element={<ProtectedRoute role="STUDENT"><HostelLeaveRequest /></ProtectedRoute>} />
            <Route path="/student/applications" element={<ProtectedRoute role="STUDENT"><StudentApplications /></ProtectedRoute>} />

            <Route path="/faculty" element={<ProtectedRoute role="FACULTY"><FacultyDashboard /></ProtectedRoute>} />
            <Route path="/faculty/classes" element={<ProtectedRoute role="FACULTY"><FacultyClasses /></ProtectedRoute>} />
            <Route path="/faculty/attendance" element={<ProtectedRoute role="FACULTY"><FacultyAttendance /></ProtectedRoute>} />
            <Route path="/faculty/grades" element={<ProtectedRoute role="FACULTY"><FacultyGrades /></ProtectedRoute>} />

            <Route path="/driver" element={<ProtectedRoute role="DRIVER"><DriverDashboard /></ProtectedRoute>} />
            <Route path="/driver/routes" element={<ProtectedRoute role="DRIVER"><DriverRoutes /></ProtectedRoute>} />
            <Route path="/driver/history" element={<ProtectedRoute role="DRIVER"><DriverHistory /></ProtectedRoute>} />

            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
