import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },
    logo: {
      url: { type: String },
      publicId: { type: String }
    },
    banner: {
      url: { type: String },
      publicId: { type: String }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Institution", institutionSchema);
