import FeeRecord from "../models/FeeRecord.js";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ─────────────────────────────────────────
   ADMIN ENDPOINTS
───────────────────────────────────────── */

/**
 * GET /finance/summary
 * Returns institution-wide fee summary stats.
 */
export const getFinanceSummary = asyncHandler(async (req, res) => {
  const { institutionId } = req.user;

  const [records, overdue] = await Promise.all([
    FeeRecord.find({ institutionId }).lean(),
    FeeRecord.find({ institutionId, status: "OVERDUE" }).lean()
  ]);

  let totalDue = 0, totalCollected = 0, totalPending = 0;

  records.forEach(r => {
    const paid = r.payments.reduce((s, p) => s + p.amount, 0);
    totalDue       += r.totalAmount;
    totalCollected += paid;
    totalPending   += Math.max(0, r.totalAmount - paid);
  });

  // Category breakdown
  const byCategory = {};
  records.forEach(r => {
    if (!byCategory[r.category]) byCategory[r.category] = { due: 0, collected: 0 };
    const paid = r.payments.reduce((s, p) => s + p.amount, 0);
    byCategory[r.category].due       += r.totalAmount;
    byCategory[r.category].collected += paid;
  });

  res.json({
    totalDue,
    totalCollected,
    totalPending,
    overdueCount: overdue.length,
    byCategory,
    recordCount: records.length
  });
});

/**
 * GET /finance/records
 * All fee records with pagination + filters.
 */
export const getAllFeeRecords = asyncHandler(async (req, res) => {
  const { institutionId } = req.user;
  const { status, category, studentId, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { institutionId };
  if (status)    filter.status = status;
  if (category)  filter.category = category;
  if (studentId) filter.studentId = studentId;

  const [total, records] = await Promise.all([
    FeeRecord.countDocuments(filter),
    FeeRecord.find(filter)
      .populate({ path: "studentId", populate: { path: "userId", select: "name email" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean()
  ]);

  // Attach virtuals manually (lean() strips them)
  const enriched = records.map(r => {
    const amountPaid = r.payments.reduce((s, p) => s + p.amount, 0);
    return { ...r, amountPaid, balance: Math.max(0, r.totalAmount - amountPaid) };
  });

  res.json({ total, page: Number(page), pages: Math.ceil(total / Number(limit)), records: enriched });
});

/**
 * POST /finance/records
 * Create a fee record for a student.
 */
export const createFeeRecord = asyncHandler(async (req, res) => {
  const { institutionId } = req.user;
  const { studentId, category, label, totalAmount, dueDate } = req.body;

  if (!studentId || !category || !totalAmount) {
    return res.status(400).json({ message: "studentId, category, and totalAmount are required" });
  }

  const student = await Student.findOne({ _id: studentId, institutionId });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const record = await FeeRecord.create({
    institutionId,
    studentId,
    category,
    label: label || "",
    totalAmount: Number(totalAmount),
    dueDate: dueDate || null
  });

  res.status(201).json({ message: "Fee record created", record });
});

/**
 * POST /finance/records/:id/pay
 * Record a payment against a fee record.
 */
export const recordPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, method, reference } = req.body;

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: "Valid payment amount required" });
  }

  const record = await FeeRecord.findOne({ _id: id, institutionId: req.user.institutionId });
  if (!record) return res.status(404).json({ message: "Fee record not found" });

  record.payments.push({
    amount: Number(amount),
    method: method || "ONLINE",
    reference: reference || "",
    recordedBy: req.user.userId,
    paidOn: new Date()
  });

  // Auto-update status
  const totalPaid = record.payments.reduce((s, p) => s + p.amount, 0);
  if (totalPaid >= record.totalAmount) {
    record.status = "PAID";
  } else if (totalPaid > 0) {
    record.status = "PARTIAL";
  }

  await record.save();

  const amountPaid = record.payments.reduce((s, p) => s + p.amount, 0);
  res.json({
    message: "Payment recorded successfully",
    amountPaid,
    balance: Math.max(0, record.totalAmount - amountPaid),
    status: record.status
  });
});

/**
 * PATCH /finance/records/:id/waive
 * Waive a fee record.
 */
export const waiveFeeRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const record = await FeeRecord.findOne({ _id: id, institutionId: req.user.institutionId });
  if (!record) return res.status(404).json({ message: "Fee record not found" });

  record.status = "WAIVED";
  record.waiveReason = reason || "";
  await record.save();

  res.json({ message: "Fee record waived" });
});

/**
 * DELETE /finance/records/:id
 */
export const deleteFeeRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await FeeRecord.findOneAndDelete({ _id: id, institutionId: req.user.institutionId });
  if (!record) return res.status(404).json({ message: "Record not found" });
  res.json({ message: "Fee record deleted" });
});

/* ─────────────────────────────────────────
   STUDENT ENDPOINT
───────────────────────────────────────── */

/**
 * GET /finance/my-fees
 * Student views their own fee records.
 */
export const getMyFees = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    userId: req.user.userId,
    institutionId: req.user.institutionId
  });

  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const records = await FeeRecord.find({
    studentId: student._id,
    institutionId: req.user.institutionId
  }).sort({ createdAt: -1 }).lean();

  const enriched = records.map(r => {
    const amountPaid = r.payments.reduce((s, p) => s + p.amount, 0);
    return { ...r, amountPaid, balance: Math.max(0, r.totalAmount - amountPaid) };
  });

  const totalDue        = enriched.reduce((s, r) => s + r.totalAmount, 0);
  const totalPaid       = enriched.reduce((s, r) => s + r.amountPaid, 0);
  const totalOutstanding = enriched.reduce((s, r) => s + r.balance, 0);

  res.json({ records: enriched, totalDue, totalPaid, totalOutstanding });
});
