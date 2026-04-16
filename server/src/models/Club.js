import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    banner: {
      url: { type: String },
      publicId: { type: String }
    },
    name: { type: String, required: true },
    description: String,
    facultyInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null   // optional — club can exist without a faculty overseer
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
      }
    ],
    clubType: {
      type: String,
      enum: ["TECHNICAL", "CULTURAL", "SPORTS"],
      default: "TECHNICAL"
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

clubSchema.index({ institutionId: 1, name: 1 }, { unique: true });
clubSchema.index({ institutionId: 1, facultyInCharge: 1 });

export default mongoose.model("Club", clubSchema);
