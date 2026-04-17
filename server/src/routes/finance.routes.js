import express from "express";
import {
  getFinanceSummary,
  getAllFeeRecords,
  createFeeRecord,
  recordPayment,
  waiveFeeRecord,
  deleteFeeRecord,
  getMyFees
} from "../controllers/finance.controller.js";
import { protect, isolateTenant } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect, isolateTenant);

/* ADMIN */
router.get("/summary",          allowRoles("ADMIN", "SUPER_ADMIN"), getFinanceSummary);
router.get("/records",          allowRoles("ADMIN", "SUPER_ADMIN"), getAllFeeRecords);
router.post("/records",         allowRoles("ADMIN", "SUPER_ADMIN"), createFeeRecord);
router.post("/records/:id/pay", allowRoles("ADMIN", "SUPER_ADMIN"), recordPayment);
router.patch("/records/:id/waive", allowRoles("ADMIN", "SUPER_ADMIN"), waiveFeeRecord);
router.delete("/records/:id",   allowRoles("ADMIN", "SUPER_ADMIN"), deleteFeeRecord);

/* STUDENT */
router.get("/my-fees", allowRoles("STUDENT"), getMyFees);

export default router;
