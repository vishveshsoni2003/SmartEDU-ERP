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

// ================= ROOT HEALTH PAGE =================
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Attendax API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px 48px; max-width: 560px; width: 90%; box-shadow: 0 25px 60px rgba(0,0,0,0.4); }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: #052e16; color: #4ade80; border: 1px solid #166534; border-radius: 999px; padding: 4px 14px; font-size: 13px; font-weight: 700; margin-bottom: 24px; }
    .dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    h1 { font-size: 28px; font-weight: 800; color: #f8fafc; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .stat { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 14px 16px; }
    .stat-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; }
    .stat-value { font-size: 18px; font-weight: 800; color: #38bdf8; margin-top: 4px; }
    .endpoints { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; }
    .ep { font-size: 13px; color: #64748b; padding: 4px 0; border-bottom: 1px solid #1e293b; }
    .ep:last-child { border-bottom: none; }
    .ep span { color: #7dd3fc; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><div class="dot"></div> All Systems Operational</div>
    <h1>Attendax ERP API</h1>
    <p>Production-grade multi-tenant ERP backend. All routes secured with JWT authentication and role-based access control.</p>
    <div class="grid">
      <div class="stat"><div class="stat-label">Port</div><div class="stat-value">${process.env.PORT || 5000}</div></div>
      <div class="stat"><div class="stat-label">Environment</div><div class="stat-value">${process.env.NODE_ENV || 'development'}</div></div>
      <div class="stat"><div class="stat-label">Version</div><div class="stat-value">1.0.0</div></div>
      <div class="stat"><div class="stat-label">Uptime</div><div class="stat-value">${Math.floor(process.uptime())}s</div></div>
    </div>
    <div class="endpoints">
      <div class="ep"><span>POST</span> /api/auth/login</div>
      <div class="ep"><span>GET</span>  /api/students</div>
      <div class="ep"><span>GET</span>  /api/faculty</div>
      <div class="ep"><span>GET</span>  /api/courses</div>
      <div class="ep"><span>GET</span>  /api/notices</div>
      <div class="ep"><span>GET</span>  /api/transport/routes</div>
      <div class="ep"><span>POST</span> /api/bulk/:module</div>
    </div>
  </div>
</body>
</html>`);
});

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
