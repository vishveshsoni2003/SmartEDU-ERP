import express from "express";
import {
  createHostel,
  addRoom,
  allocateRoom,
  deallocateRoom,
  getHostels,
  deleteHostel,
} from "../controllers/hostel.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// ADMIN
router.post("/", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), createHostel);
router.post("/:hostelId/rooms", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), addRoom);
router.post("/:hostelId/allocate", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), allocateRoom);
router.delete("/:hostelId/deallocate/:studentId", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), deallocateRoom);
router.get("/", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN", "STUDENT"), getHostels);
router.delete("/:hostelId", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), deleteHostel);

export default router;
