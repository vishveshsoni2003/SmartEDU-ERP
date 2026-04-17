import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ["HOLIDAY", "VACATION"],
      default: "HOLIDAY"
    },
    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Holiday", holidaySchema);
