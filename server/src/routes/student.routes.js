import express from "express";
import {
  createStudent,
  getAllStudents,
  getMyProfile,
  updateStudent,
  deleteStudent
} from "../controllers/student.controller.js";
import {
  getStudentImportTemplate,
  importStudents,
  getImportJobs,
  getImportJobStatus
} from "../controllers/studentImport.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { uploadStudentProfile, uploadFileMemory } from "../middlewares/upload.middleware.js";

const router = express.Router();

// ADMIN APIs - BULK IMPORTS
router.get("/import/template", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), getStudentImportTemplate);
router.post("/import", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), uploadFileMemory.single("file"), importStudents);
router.get("/import/history", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), getImportJobs);
router.get("/import/:id/status", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), getImportJobStatus);

// STUDENT APIs — must be BEFORE /:id to prevent /me being matched as an ID param
router.get("/me", protect, getMyProfile);

// ADMIN APIs - STANDARD CRUD
router.post("/", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), uploadStudentProfile.single("image"), createStudent);
router.get("/", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN", "FACULTY"), getAllStudents);
router.put("/:id", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), uploadStudentProfile.single("image"), updateStudent);
router.delete("/:id", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), deleteStudent);

export default router;
