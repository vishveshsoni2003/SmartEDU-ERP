import mongoose from "mongoose";

const importJobSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["STUDENTS", "FACULTY", "HOSTEL_ROOMS", "TRANSPORT_USERS", "COURSES", "HOSTELS"],
            required: true,
        },
        filename: {
            type: String,
            required: true,
        },
        totalRows: {
            type: Number,
            default: 0,
        },
        successRows: {
            type: Number,
            default: 0,
        },
        failedRows: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
            default: "PENDING",
        },
        errorSummary: [
            {
                row: Number,
                identifier: String,
                message: String,
            }
        ]
    },
    { timestamps: true }
);

importJobSchema.index({ institutionId: 1, createdAt: -1 });

export default mongoose.model("ImportJob", importJobSchema);
