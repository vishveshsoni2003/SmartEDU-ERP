import express from "express";
import {
  createLecture,
  getLectures,
  updateLecture,
  deleteLecture
} from "../controllers/lecture.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  isolateTenant,
  allowRoles("ADMIN", "SUB_ADMIN"),
  createLecture
);

router.get(
  "/",
  protect,
  isolateTenant,
  allowRoles("ADMIN", "SUB_ADMIN", "FACULTY", "STUDENT"),
  getLectures
);

router.put(
  "/:id",
  protect,
  isolateTenant,
  allowRoles("ADMIN", "SUB_ADMIN"),
  updateLecture
);

router.delete(
  "/:id",
  protect,
  isolateTenant,
  allowRoles("ADMIN", "SUB_ADMIN"),
  deleteLecture
);

export default router;
