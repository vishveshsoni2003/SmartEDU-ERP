import express from "express";
import {
  createRoute,
  createBus,
  createDriver,
  getBusByNumber,
  getRoutes,
  getBuses,
  deleteRoute,
  deleteBus
} from "../controllers/transport.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// ADMIN
router.post("/routes", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), createRoute);
router.delete("/routes/:routeId", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), deleteRoute);
router.post("/buses", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), createBus);
router.delete("/buses/:busId", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), deleteBus);
router.post("/drivers", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), createDriver);
router.get("/routes", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), getRoutes);
router.get("/buses", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), getBuses);

// STUDENT + FACULTY
router.get(
  "/bus/:busNumber",
  protect,
  isolateTenant,
  allowRoles("STUDENT", "FACULTY", "ADMIN", "SUPER_ADMIN"),
  getBusByNumber
);

export default router;
