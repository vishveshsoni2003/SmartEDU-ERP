import User from "../models/User.js";
import Faculty from "../models/Faculty.js";
import bcrypt from "bcryptjs";
import Lecture from "../models/Lecture.js";
import Mentor from "../models/Mentor.js";
import Notice from "../models/Notice.js";
import HostelLeave from "../models/HostelLeave.js";
import Hostel from "../models/Hostel.js";
// import Faculty from "../models/Faculty.js";
/**
 * CREATE FACULTY (ADMIN)
 */
export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, employeeId, facultyType } = req.body;

    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "FACULTY",
      institutionId: req.user.institutionId,
    });

    const faculty = await Faculty.create({
      userId: user._id,
      institutionId: req.user.institutionId,
      employeeId,
      facultyType,
    });

    res.status(201).json({
      message: "Faculty created successfully",
      facultyId: faculty._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL FACULTY (ADMIN)
 */
export const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({
      institutionId: req.user.institutionId,
    }).populate("userId", "name email");

    res.json({ faculty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET OWN PROFILE (FACULTY)
 */
export const getMyFacultyProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      userId: req.user.userId,
    }).populate("userId", "name email");

    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    res.json({ faculty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getFacultyDashboard = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      userId: req.user.userId,
    });

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty profile not found",
      });
    }

    const dayMap = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const today = dayMap[new Date().getDay()];

    /* =========================
       TODAY'S LECTURES
    ========================= */
    const todayLectures = await Lecture.find({
      institutionId: req.user.institutionId,
      facultyId: faculty._id,
      day: today,
    })
      .populate("courseId", "name")
      .populate("subjectId", "name code")
      .sort({ startTime: 1 });

    /* =========================
       MENTOR CHECK
    ========================= */
    const mentor = await Mentor.findOne({
      institutionId: req.user.institutionId,
      facultyId: faculty._id,
    }).populate("courseId", "name code");

    const isMentor = !!mentor;

    let mentorDetails = null;
    if (mentor) {
      mentorDetails = {
        courseId: mentor.courseId._id,
        course: mentor.courseId, // populated (name, code)
        year: mentor.year,
        semester: mentor.semester,
        section: mentor.section,
      };
    }

    /* =========================
       HOSTEL LEAVES (WARDEN ONLY)
    ========================= */
    let pendingLeaves = 0;
    if (faculty.facultyType.includes("WARDEN")) {
      // Get hostels assigned to this warden
      const hostels = await Hostel.find({
        institutionId: req.user.institutionId,
        wardenId: faculty._id
      });

      const hostelIds = hostels.map(h => h._id);

      // Count pending leaves only for this warden's hostels
      if (hostelIds.length > 0) {
        pendingLeaves = await HostelLeave.countDocuments({
          institutionId: req.user.institutionId,
          hostelId: { $in: hostelIds },
          status: "PENDING"
        });
      }
    }

    /* =========================
       NOTICES COUNT
    ========================= */
    const noticeQuery = {
      institutionId: req.user.institutionId,
      $or: [{ targetAudience: "ALL" }, { targetAudience: "FACULTY" }],
    };

    if (mentor) {
      noticeQuery.$or.push({
        targetAudience: "MENTOR",
        courseId: mentor.courseId,
        year: mentor.year,
        semester: mentor.semester,
        section: mentor.section,
      });
    }

    const noticesCount = await Notice.countDocuments(noticeQuery);

    res.json({
      todayLectures,
      isMentor,
      mentorDetails,
      pendingLeaves,
      noticesCount,
      facultyType: faculty.facultyType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
