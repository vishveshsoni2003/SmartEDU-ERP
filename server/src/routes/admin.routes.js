import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import {
  createInstitutionAdmin,
  getAdminStats,
  getInstitutionAdmins,
  toggleAdminStatus
} from "../controllers/admin.controller.js";

const router = express.Router();

// Create admin (sub-admin)
router.post(
  "/create-admin",
  protect,
  allowRoles("ADMIN"),
  createInstitutionAdmin
);

// Get all admins of institution
router.get(
  "/admins",
  protect,
  allowRoles("ADMIN"),
  getInstitutionAdmins
);

router.get(
  "/stats",
  protect,
  allowRoles("ADMIN"),
  getAdminStats
);

// Toggle admin active/deactivated status
router.patch(
  "/admins/:id/toggle-status",
  protect,
  allowRoles("ADMIN"),
  toggleAdminStatus
);

export default router;
