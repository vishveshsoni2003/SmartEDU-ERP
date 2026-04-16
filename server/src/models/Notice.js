import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    attachment: {
      url: { type: String },
      publicId: { type: String }
    },
    targetAudience: {
      type: [String],
      enum: [
        "ALL",
        "STUDENT",
        "FACULTY",
        "HOSTELLERS",
        "BUS_USERS",
        "CLUB_MEMBERS"
      ],
      default: ["ALL"]
    },
    targetHostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
    targetBusId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    targetClubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
    isArchived: { type: Boolean, default: false },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

noticeSchema.index({ institutionId: 1, isArchived: 1, createdAt: -1 });
noticeSchema.index({ institutionId: 1, "targetAudience": 1 });

export default mongoose.model("Notice", noticeSchema);
