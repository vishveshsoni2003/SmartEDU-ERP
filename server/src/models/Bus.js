import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    busNumber: {
      type: String,
      required: true,
      unique: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    capacity: { type: Number, default: 40 },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
    tripStatus: {
      type: String,
      enum: ["IDLE", "ACTIVE", "PAUSED", "ENDED"],
      default: "IDLE"
    },
    tripStartedAt: { type: Date, default: null },
    tripEndedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Bus", busSchema);
