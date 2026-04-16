import express from "express";
import {
  createInstitution,
  getAllInstitutions,
  updateInstitutionStatus,
  updateInstitution,
  deleteInstitution
} from "../controllers/institution.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { uploadInstitutionLogo } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Create institution
router.post(
  "/",
  protect,
  allowRoles("SUPER_ADMIN"),
  uploadInstitutionLogo.single("logo"),
  createInstitution
);

// Get all institutions
router.get(
  "/",
  protect,
  allowRoles("SUPER_ADMIN"),
  getAllInstitutions
);

// Enable / Disable institution
router.patch(
  "/:id/status",
  protect,
  allowRoles("SUPER_ADMIN"),
  updateInstitutionStatus
);

router.put(
  "/:id",
  protect,
  allowRoles("SUPER_ADMIN"),
  uploadInstitutionLogo.single("logo"),
  updateInstitution
);

router.delete(
  "/:id",
  protect,
  allowRoles("SUPER_ADMIN"),
  deleteInstitution
);

export default router;
