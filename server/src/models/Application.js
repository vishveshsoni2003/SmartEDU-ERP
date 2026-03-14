import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["HOSTEL_ADMISSION", "TRANSPORT", "SCHOLARSHIP", "LEAVE_OF_ABSENCE", "OTHER"],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    approvalRequired: {
      type: String,
      enum: ["FACULTY", "WARDEN", "ADMIN"],
      default: "FACULTY"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    },
    rejectionReason: {
      type: String,
      default: null
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
