import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution"
    },
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "SUB_ADMIN", "FACULTY", "STUDENT", "DRIVER"],
      required: true
    },
    status: { type: String, default: "ACTIVE" },
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
