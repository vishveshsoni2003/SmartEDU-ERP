import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    profileImage: {
      url: { type: String },
      publicId: { type: String }
    },
    employeeId: {
      type: String,
      required: true
    },
    designation: {
      type: [String],
      enum: ["LECTURER", "WARDEN", "CLUB_INCHARGE", "TRANSPORT_MANAGER"],
      default: ["LECTURER"]
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ON_LEAVE", "RESIGNED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

facultySchema.index({ institutionId: 1, employeeId: 1 }, { unique: true });
facultySchema.index({ institutionId: 1, departmentId: 1 });

export default mongoose.model("Faculty", facultySchema);
