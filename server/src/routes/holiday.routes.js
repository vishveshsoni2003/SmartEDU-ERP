import express from "express";
import {
  createHoliday,
  getHolidays,
  updateHoliday,
  deleteHoliday
} from "../controllers/holiday.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  isolateTenant,
  allowRoles("ADMIN", "SUB_ADMIN", "SUPER_ADMIN"),
  createHoliday
);

router.get(
  "/",
  protect,
  isolateTenant,
  getHolidays
);

router.put(
  "/:id",
  protect,
  isolateTenant,
  allowRoles("ADMIN", "SUB_ADMIN", "SUPER_ADMIN"),
  updateHoliday
);

router.delete(
  "/:id",
  protect,
  isolateTenant,
  allowRoles("ADMIN", "SUB_ADMIN", "SUPER_ADMIN"),
  deleteHoliday
);

export default router;
