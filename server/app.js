import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// ================= CONFIG =================
import connectDB from "./src/config/db.js";

// ================= ROUTES =================
import authRoutes from "./src/routes/auth.routes.js";
import institutionRoutes from "./src/routes/institution.routes.js";
import studentRoutes from "./src/routes/student.routes.js";
import facultyRoutes from "./src/routes/faculty.routes.js";
import hostelRoutes from "./src/routes/hostel.routes.js";
import hostelLeaveRoutes from "./src/routes/hostelLeave.routes.js";
import noticeRoutes from "./src/routes/notice.routes.js";
import clubRoutes from "./src/routes/club.routes.js";
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

// ================= MODELS =================
import Bus from "./src/models/Bus.js";

// ================= INIT =================
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= REST ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/hostel-leaves", hostelLeaveRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/clubs", clubRoutes);
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

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  /**
   * STUDENT / ADMIN / FACULTY joins a bus room
   */
  socket.on("joinBus", (busId) => {
    if (!busId) return;
    socket.join(`bus_${busId}`);
    console.log(`Socket ${socket.id} joined bus_${busId}`);
  });

  /**
   * DRIVER sends live location
   */
  socket.on("bus:location", async ({ busId, lat, lng }) => {
    if (!busId || lat == null || lng == null) {
      return;
    }

    try {
      const bus = await Bus.findById(busId);
      if (!bus) return;

      bus.currentLocation = {
        lat,
        lng,
        updatedAt: new Date()
      };
      await bus.save();

      // Broadcast only to viewers of this bus
      io.to(`bus_${busId}`).emit("bus:location:update", {
        lat,
        lng,
        updatedAt: bus.currentLocation.updatedAt
      });

    } catch (error) {
      console.error("🚨 Bus location error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SmartEdu ERP Server running on port ${PORT}`);
});
