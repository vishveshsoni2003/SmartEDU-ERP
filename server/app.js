import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// ================= CONFIG =================
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/utils/socket.js";

// ================= ROUTES =================
import authRoutes from "./src/routes/auth.routes.js";
import institutionRoutes from "./src/routes/institution.routes.js";
import studentRoutes from "./src/routes/student.routes.js";
import facultyRoutes from "./src/routes/faculty.routes.js";
import hostelRoutes from "./src/routes/hostel.routes.js";
import hostelLeaveRoutes from "./src/routes/hostelLeave.routes.js";
import noticeRoutes from "./src/routes/notice.routes.js";
import clubRoutes from "./src/routes/club.routes.js";
import bulkRoutes from "./src/routes/bulk.routes.js";
import transportRoutes from "./src/routes/transport.routes.js";
import timetableRoutes from "./src/routes/timetable.routes.js";
import attendanceRoutes from "./src/routes/attendance.routes.js";
import superAdminRoutes from "./src/routes/superAdmin.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import courseRoutes from "./src/routes/course.routes.js";
import sectionRoutes from "./src/routes/section.routes.js";
import subjectRoutes from "./src/routes/subject.routes.js";
import lectureRoutes from "./src/routes/lecture.routes.js";
import mentorRoutes from "./src/routes/mentor.routes.js";
import holidayRoutes from "./src/routes/holiday.routes.js";
import facultyAttendanceRoutes from "./src/routes/facultyAttendance.routes.js";
import driverRoutes from "./src/routes/driver.routes.js";
import applicationRoutes from "./src/routes/application.routes.js";
import reportRoutes from "./src/routes/report.routes.js";
import { logAudit } from "./src/middlewares/audit.middleware.js";

// ================= INIT =================
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ================= SECURITY & MIDDLEWARE =================
app.use(helmet());
app.use(cors());
app.use(express.json());

const isDev = process.env.NODE_ENV !== "production";

// General API limiter — relaxed to 500 req/15min; skipped entirely in dev
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 0 : 500,          // 0 = unlimited in development
  skip: () => isDev,             // Hard skip in dev mode
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again after 15 minutes." }
});

// Auth limiter — only applies in production (10 login attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 0 : 10,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait 15 minutes." }
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);  // Extra strict only on login endpoint
app.use(logAudit("API", "General API Request"));

// ================= REST ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/hostel-leaves", hostelLeaveRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/bulk", bulkRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/faculty-attendance", facultyAttendanceRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/reports", reportRoutes);

// ================= SOCKET.IO =================
initSocket(server);

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Attendax ERP Server running on port ${PORT}`);
});
