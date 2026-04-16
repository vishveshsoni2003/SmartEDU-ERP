import express from "express";
import { importGenericData, getImportTemplate } from "../controllers/bulk.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { uploadFileMemory } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/:moduleType/template", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), getImportTemplate);
router.post("/:moduleType", protect, isolateTenant, allowRoles("ADMIN", "SUPER_ADMIN"), uploadFileMemory.single("file"), importGenericData);

export default router;
