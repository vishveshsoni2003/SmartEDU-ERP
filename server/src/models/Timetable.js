import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    roomId: { type: String, required: true },
});

const timetableSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        sectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: true
        },
        semester: {
            type: Number,
            required: true
        },
        lectures: [lectureSchema],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Optimize query routing
timetableSchema.index({ institutionId: 1, courseId: 1, sectionId: 1 });

export default mongoose.model("Timetable", timetableSchema);
