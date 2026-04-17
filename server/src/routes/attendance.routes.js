import {
  getLectureAttendancePercentage,
  getMentorAttendancePercentage,
  getLectureAttendanceHistory
} from "../controllers/attendance.controller.js";
import express from "express";
import {
  markLectureAttendance,
  markMentorAttendance
} from "../controllers/attendance.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/lecture",
  protect,
  isolateTenant,
  allowRoles("FACULTY"),
  markLectureAttendance
);

router.post(
  "/mentor",
  protect,
  isolateTenant,
  allowRoles("FACULTY"),
  markMentorAttendance
);

router.get(
  "/lecture/percentage/:studentId",
  protect,
  isolateTenant,
  allowRoles("STUDENT", "ADMIN", "SUB_ADMIN"),
  getLectureAttendancePercentage
);

router.get(
  "/mentor/percentage/:studentId",
  protect,
  isolateTenant,
  allowRoles("STUDENT", "ADMIN", "SUB_ADMIN"),
  getMentorAttendancePercentage
);

// Faculty attendance history
router.get(
  "/lecture/history",
  protect,
  isolateTenant,
  allowRoles("FACULTY", "ADMIN", "SUB_ADMIN"),
  getLectureAttendanceHistory
);

export default router;
