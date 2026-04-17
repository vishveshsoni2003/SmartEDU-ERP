import mongoose from "mongoose";

/**
 * FeeRecord — tracks per-student fee obligations and payment history.
 * One record per student per fee period (e.g. semester / annual).
 */
const paymentSchema = new mongoose.Schema({
  amount:      { type: Number, required: true },
  paidOn:      { type: Date, default: Date.now },
  method:      { type: String, enum: ["CASH", "ONLINE", "CHEQUE", "DD"], default: "ONLINE" },
  reference:   { type: String, default: "" },
  recordedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const feeRecordSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    /* Fee category: tuition, hostel, transport, exam, library, misc */
    category: {
      type: String,
      enum: ["TUITION", "HOSTEL", "TRANSPORT", "EXAM", "LIBRARY", "MISC"],
      required: true
    },
    label:        { type: String, default: "" },         // e.g. "Sem 1 2025-26"
    totalAmount:  { type: Number, required: true },       // total due
    dueDate:      { type: Date },
    payments:     [paymentSchema],
    status: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID", "OVERDUE", "WAIVED"],
      default: "PENDING"
    },
    waiveReason:  { type: String, default: "" }
  },
  { timestamps: true }
);

/* Virtual: amount paid so far */
feeRecordSchema.virtual("amountPaid").get(function () {
  return this.payments.reduce((sum, p) => sum + p.amount, 0);
});

/* Virtual: balance remaining */
feeRecordSchema.virtual("balance").get(function () {
  return Math.max(0, this.totalAmount - this.amountPaid);
});

feeRecordSchema.set("toJSON",   { virtuals: true });
feeRecordSchema.set("toObject", { virtuals: true });

feeRecordSchema.index({ institutionId: 1, studentId: 1 });
feeRecordSchema.index({ institutionId: 1, status: 1 });
feeRecordSchema.index({ institutionId: 1, dueDate: 1 });

export default mongoose.model("FeeRecord", feeRecordSchema);
