import express from "express";
import {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
  archiveNotice
} from "../controllers/notice.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { uploadNoticeAttachment } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", protect, isolateTenant, allowRoles("ADMIN", "FACULTY"), uploadNoticeAttachment.single("attachment"), createNotice);
router.get("/", protect, isolateTenant, getNotices);
router.put("/:id", protect, isolateTenant, allowRoles("ADMIN", "FACULTY"), uploadNoticeAttachment.single("attachment"), updateNotice);
router.delete("/:id", protect, isolateTenant, allowRoles("ADMIN", "FACULTY"), deleteNotice);
router.put("/:id/archive", protect, isolateTenant, allowRoles("ADMIN"), archiveNotice);

export default router;
