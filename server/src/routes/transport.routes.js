import express from "express";
import {
  createRoute,
  createBus,
  createDriver,
  getBusByNumber,
  getBusById,
  getActiveBuses,
  getRoutes,
  getBuses,
  getDrivers,
  deleteRoute,
  deleteBus,
  unassignBusFromDriver,
  startTrip,
  pauseTrip,
  resumeTrip,
  endTrip
} from "../controllers/transport.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { assignBusToDriver } from "../controllers/driver.controller.js";

const router = express.Router();

// ── ADMIN ─────────────────────────────────────────────────────────────────────
router.post("/routes",    protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), createRoute);
router.delete("/routes/:routeId", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), deleteRoute);
router.post("/buses",     protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), createBus);
router.delete("/buses/:busId", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), deleteBus);
router.post("/drivers",   protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), createDriver);
router.get("/routes",     protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), getRoutes);
router.get("/buses",      protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN", "STUDENT", "FACULTY"), getBuses);
router.get("/drivers",    protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), getDrivers);

// ── DRIVER → BUS assignment ───────────────────────────────────────────────────
router.post("/assign-driver",  protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), assignBusToDriver);
router.delete("/drivers/:driverId/unassign", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), unassignBusFromDriver);

// ── DRIVER → TRIP LIFECYCLE ──────────────────────────────────────────────────
router.post("/trip/start",  protect, isolateTenant, allowRoles("DRIVER"), startTrip);
router.post("/trip/pause",  protect, isolateTenant, allowRoles("DRIVER"), pauseTrip);
router.post("/trip/resume", protect, isolateTenant, allowRoles("DRIVER"), resumeTrip);
router.post("/trip/end",    protect, isolateTenant, allowRoles("DRIVER"), endTrip);

// ── MONITORING — ADMIN / FACULTY ──────────────────────────────────────────────
router.get("/buses/active", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN", "FACULTY"), getActiveBuses);

// ── PER-BUS LOOKUP — DRIVER / STUDENT / ADMIN ─────────────────────────────────
// NOTE: /buses/active must be declared BEFORE /buses/:busId to avoid route collision
router.get("/buses/:busId", protect, isolateTenant, allowRoles("DRIVER", "STUDENT", "FACULTY", "ADMIN", "SUPER_ADMIN"), getBusById);

// ── STUDENT + FACULTY — by bus number ────────────────────────────────────────
router.get(
  "/bus/:busNumber",
  protect, isolateTenant,
  allowRoles("STUDENT", "FACULTY", "ADMIN", "SUPER_ADMIN"),
  getBusByNumber
);

export default router;
