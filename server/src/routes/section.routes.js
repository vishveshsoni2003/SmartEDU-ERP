import express from "express";
import {
  createSection,
  getSections
} from "../controllers/section.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  isolateTenant,
  allowRoles("ADMIN", "SUB_ADMIN"),
  createSection
);

router.get(
  "/",
  protect,
  isolateTenant,
  allowRoles("ADMIN", "SUB_ADMIN", "FACULTY"),
  getSections
);

export default router;
