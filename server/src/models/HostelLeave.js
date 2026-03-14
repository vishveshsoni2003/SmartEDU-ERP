import mongoose from "mongoose";

const hostelLeaveSchema = new mongoose.Schema(
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
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    },
    rejectionReason: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("HostelLeave", hostelLeaveSchema);
