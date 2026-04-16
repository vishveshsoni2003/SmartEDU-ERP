import express from "express";
import {
  getClubs,
  createClub,
  updateClub,
  applyToClub,
  getApplications,
  facultyDecision,
  adminDecision,
  removeMember
} from "../controllers/club.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { uploadClubBanner } from "../middlewares/upload.middleware.js";

const router = express.Router();

// ANY ROLE
router.get("/", protect, isolateTenant, getClubs);

// ADMIN
router.post("/", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), uploadClubBanner.single("banner"), createClub);
router.put("/:id", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), uploadClubBanner.single("banner"), updateClub);
router.patch("/admin/:applicationId", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), adminDecision);
router.delete("/:clubId/members/:studentId", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), removeMember);

// STUDENT
router.post("/:clubId/apply", protect, isolateTenant, allowRoles("STUDENT"), applyToClub);

// FACULTY / ADMIN
router.get("/applications", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN", "FACULTY"), getApplications);
router.patch("/faculty/:applicationId", protect, isolateTenant, allowRoles("FACULTY"), facultyDecision);

export default router;
