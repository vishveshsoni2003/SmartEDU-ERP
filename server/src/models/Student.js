import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    /* ==========================
       AUTH & OWNERSHIP
    ========================== */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },

    /* ==========================
       ACADEMIC IDENTITY
    ========================== */
    profileImage: {
      url: { type: String },
      publicId: { type: String }
    },
    enrollmentNo: {
      type: String,
      required: true,
      unique: true
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

    rollNo: {
      type: String,
      required: true,
    },

    /* ==========================
       STUDENT CATEGORY
    ========================== */
    studentType: {
      type: String,
      enum: ["HOSTELLER", "DAY_SCHOLAR", "BUS_SERVICE"],
      required: true
    },

    /* ==========================
       HOSTEL DETAILS
    ========================== */
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      default: null
    },

    roomNumber: {
      type: String,
      default: null
    },

    /* ==========================
       TRANSPORT DETAILS
    ========================== */
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      default: null
    },

    /* ==========================
       CLUBS & ACTIVITIES
    ========================== */
    clubs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club"
      }
    ],

    /* ==========================
       STATUS & LIFECYCLE
    ========================== */
    isActive: {
      type: Boolean,
      default: true
    },

    admissionDate: {
      type: Date,
      default: Date.now
    },

    exitDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/* ==========================
   INDEXES (IMPORTANT)
========================== */
studentSchema.index({
  institutionId: 1,
  courseId: 1,
  year: 1,
  section: 1
});

studentSchema.index({ institutionId: 1, enrollmentNo: 1 }, { unique: true });
studentSchema.index({ institutionId: 1, rollNo: 1 }, { unique: true });
studentSchema.index({ institutionId: 1, hostelId: 1 });
studentSchema.index({ institutionId: 1, busId: 1 });

export default mongoose.model("Student", studentSchema);
