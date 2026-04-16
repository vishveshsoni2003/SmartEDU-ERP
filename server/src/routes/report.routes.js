import express from "express";
import {
    getHostelOccupancyReport,
    getBusUsageReport,
    getPendingApprovalsReport
} from "../controllers/report.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(isolateTenant);
router.use(allowRoles("ADMIN", "SUPER_ADMIN"));

router.get("/hostel-occupancy", getHostelOccupancyReport);
router.get("/bus-usage", getBusUsageReport);
router.get("/pending-approvals", getPendingApprovalsReport);

export default router;
