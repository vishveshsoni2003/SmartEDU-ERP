import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["INFO", "ALERT", "APPROVAL", "REMINDER"],
            default: "INFO"
        },
        isRead: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
