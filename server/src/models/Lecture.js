import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
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

    year: {
      type: Number,
      required: true
    },

    section: {
      type: String,
      required: true
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true
    },

    day: {
      type: String,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY"
      ],
      required: true
    },

    startTime: {
      type: String, // "10:00"
      required: true
    },

    endTime: {
      type: String, // "11:00"
      required: true
    },

    room: {
      type: String,
      default: ""
    },

    lectureType: {
      type: String,
      enum: ["THEORY", "PRACTICAL", "TUTORIAL", "LAB"],
      required: true
    }
  },
  { timestamps: true }
);

/* Prevent duplicate lecture slot */
lectureSchema.index(
  {
    institutionId: 1,
    courseId: 1,
    year: 1,
    section: 1,
    day: 1,
    startTime: 1
  },
  { unique: true }
);

export default mongoose.model("Lecture", lectureSchema);
