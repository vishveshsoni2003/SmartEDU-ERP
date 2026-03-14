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
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// ADMIN
router.post("/routes", protect, allowRoles("ADMIN"), createRoute);
router.delete("/routes/:routeId", protect, allowRoles("ADMIN"), deleteRoute);
router.post("/buses", protect, allowRoles("ADMIN"), createBus);
router.delete("/buses/:busId", protect, allowRoles("ADMIN"), deleteBus);
router.post("/drivers", protect, allowRoles("ADMIN"), createDriver);

// STUDENT + FACULTY
router.get(
  "/bus/:busNumber",
  protect,
  allowRoles("STUDENT", "FACULTY"),
  getBusByNumber
);
router.get(
  "/routes",
  protect,
  allowRoles("ADMIN"),
  getRoutes
);
router.get(
  "/buses",
  protect,
  allowRoles("ADMIN"),
  getBuses
);

export default router;
