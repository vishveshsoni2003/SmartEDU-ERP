import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

// Pages
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import HostelLeaveRequest from "./pages/student/HostelLeaveRequest";
import StudentApplications from "./pages/student/StudentApplications";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyClasses from "./pages/faculty/FacultyClasses";
import FacultyAttendance from "./pages/faculty/FacultyAttendance";
import FacultyGrades from "./pages/faculty/FacultyGrades";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminReports from "./pages/admin/AdminReports";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverRoutes from "./pages/driver/DriverRoutes";
import DriverHistory from "./pages/driver/DriverHistory";
import Settings from "./pages/Settings";

// Public landing (optional)
import Layout from "./components/layout/Layout";
import Navbar from "./components/layout/Navbar";
import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";



function App() {
  const { user } = useAuth();

  /**
   * Auto redirect user after login based on role
   */
  const getRedirectPath = () => {
    if (!user) return "/login";

    // Check if FACULTY with TRANSPORT_MANAGER (should go to driver route)
    if (user.role === "FACULTY" && user.facultyType?.includes("TRANSPORT_MANAGER")) {
      return "/driver";
    }

    switch (user.role) {
      case "STUDENT":
        return "/student";
      case "FACULTY":
        return "/faculty";
      case "ADMIN":
        return "/admin";
      case "DRIVER":
        return "/driver";
      default:
        return "/login";
    }
  };

  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/super-admin/login" element={<SuperAdminLogin />} />

        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}>
              <AdminCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}>
              <AdminAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["ADMIN", "SUB_ADMIN"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/hostel-leave"
          element={
            <ProtectedRoute role="STUDENT">
              <HostelLeaveRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/applications"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty"
          element={
            <ProtectedRoute role="FACULTY">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/classes"
          element={
            <ProtectedRoute role="FACULTY">
              <FacultyClasses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/attendance"
          element={
            <ProtectedRoute role="FACULTY">
              <FacultyAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/grades"
          element={
            <ProtectedRoute role="FACULTY">
              <FacultyGrades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver"
          element={
            <ProtectedRoute role="DRIVER">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/routes"
          element={
            <ProtectedRoute role="DRIVER">
              <DriverRoutes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/history"
          element={
            <ProtectedRoute role="DRIVER">
              <DriverHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
