import { getLectureAttendancePercentage, getMentorAttendancePercentage, getLectureAttendanceHistory } from "../controllers/attendance.controller.js";
import express from "express";
import {
  markLectureAttendance,
  markMentorAttendance
} from "../controllers/attendance.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/lecture",
  protect,
  allowRoles("FACULTY"),
  markLectureAttendance
);

router.post(
  "/mentor",
  protect,
  allowRoles("FACULTY"),
  markMentorAttendance
);

router.get(
  "/lecture/percentage/:studentId",
  protect,
  allowRoles("STUDENT", "ADMIN"),
  getLectureAttendancePercentage
);
router.get(
  "/mentor/percentage/:studentId",
  protect,
  allowRoles("STUDENT", "ADMIN"),
  getMentorAttendancePercentage
);

// Faculty attendance history
router.get(
  "/lecture/history",
  protect,
  allowRoles("FACULTY", "ADMIN"),
  getLectureAttendanceHistory
);

export default router;
