import express from "express";
import {
  createDriver,
  deleteDriver,
  assignBusToDriver,
  getDriverDashboard
} from "../controllers/driver.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// ADMIN — create a new driver account
router.post(
  "/",
  protect,
  allowRoles("ADMIN", "SUPER_ADMIN"),
  createDriver
);

// ADMIN — delete a driver account
router.delete(
  "/:id",
  protect,
  allowRoles("ADMIN", "SUPER_ADMIN"),
  deleteDriver
);

// ADMIN — legacy direct assignment path (kept for backwards compat)
router.post(
  "/assign-bus",
  protect,
  allowRoles("ADMIN", "SUPER_ADMIN"),
  assignBusToDriver
);

// DRIVER — their own dashboard (role DRIVER only)
router.get(
  "/dashboard",
  protect,
  allowRoles("DRIVER"),
  getDriverDashboard
);

export default router;
