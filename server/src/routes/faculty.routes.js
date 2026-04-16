import express from "express";
import {
  createFaculty,
  getAllFaculty,
  getFacultyDashboard,
  getMyFacultyProfile,
  updateFaculty,
  deleteFaculty
} from "../controllers/faculty.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { uploadFacultyProfile } from "../middlewares/upload.middleware.js";

const router = express.Router();

// ADMIN APIs
router.post("/", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), uploadFacultyProfile.single("image"), createFaculty);
router.get("/", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), getAllFaculty);
router.put("/:id", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), uploadFacultyProfile.single("image"), updateFaculty);
router.delete("/:id", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), deleteFaculty);

// FACULTY APIs
router.get("/me", protect, allowRoles("FACULTY"), getMyFacultyProfile);
router.get(
  "/dashboard",
  protect,
  allowRoles("FACULTY"),
  getFacultyDashboard
);

export default router;
