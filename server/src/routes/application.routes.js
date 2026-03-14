import express from "express";
import {
  submitApplication,
  getMyApplications,
  getPendingApplications,
  updateApplicationStatus
} from "../controllers/application.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// STUDENT
router.post("/submit", protect, allowRoles("STUDENT"), submitApplication);
router.get("/my-applications", protect, allowRoles("STUDENT"), getMyApplications);

// WARDEN / FACULTY
router.get("/pending", protect, allowRoles("FACULTY"), getPendingApplications);
router.patch(
  "/:applicationId/status",
  protect,
  allowRoles("FACULTY"),
  updateApplicationStatus
);

export default router;
