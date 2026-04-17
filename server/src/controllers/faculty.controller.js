import User from "../models/User.js";
import Faculty from "../models/Faculty.js";
import bcrypt from "bcryptjs";
import Lecture from "../models/Lecture.js";
import Mentor from "../models/Mentor.js";
import Notice from "../models/Notice.js";
import HostelLeave from "../models/HostelLeave.js";
import Hostel from "../models/Hostel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * CREATE FACULTY (ADMIN)
 */
export const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, password, employeeId, facultyType } = req.body;

  if (!name || !email || !password || !employeeId) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
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

  let profileImage = { url: null, publicId: null };
  if (req.file) {
    profileImage.url = req.file.path;
    profileImage.publicId = req.file.filename;
  }

  let faculty;
  try {
    faculty = await Faculty.create({
      userId: user._id,
      institutionId: req.user.institutionId,
      profileImage,
      employeeId,
      facultyType
    });
  } catch (dbError) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    await User.findByIdAndDelete(user._id);
    throw dbError;
  }

  res.status(201).json({
    message: "Faculty created successfully",
    facultyId: faculty._id,
  });
});

/**
 * GET ALL FACULTY (ADMIN)
 */
export const getAllFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.find({
    institutionId: req.user.institutionId,
  }).populate("userId", "name email status");

  res.json({ faculty });
});

/**
 * GET OWN PROFILE (FACULTY)
 */
export const getMyFacultyProfile = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findOne({
    userId: req.user.userId,
  }).populate("userId", "name email");

  if (!faculty) {
    return res.status(404).json({ message: "Faculty profile not found" });
  }

  res.json({ faculty });
});

/**
 * UPDATE FACULTY (ADMIN)
 */
export const updateFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const faculty = await Faculty.findById(id);
  if (!faculty || faculty.institutionId.toString() !== req.user.institutionId.toString()) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(404).json({ message: "Faculty not found" });
  }

  const updateData = { ...req.body };

  if (req.file) {
    if (faculty.profileImage && faculty.profileImage.publicId) {
      await deleteFromCloudinary(faculty.profileImage.publicId);
    }
    updateData.profileImage = {
      url: req.file.path,
      publicId: req.file.filename
    };
  }

  const updatedFaculty = await Faculty.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  res.status(200).json({ message: "Faculty updated successfully", faculty: updatedFaculty });
});

/**
 * DELETE FACULTY (ADMIN)
 */
export const deleteFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const faculty = await Faculty.findById(id);
  if (!faculty || faculty.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(404).json({ message: "Faculty not found" });
  }

  if (faculty.profileImage && faculty.profileImage.publicId) {
    await deleteFromCloudinary(faculty.profileImage.publicId);
  }

  await User.findByIdAndDelete(faculty.userId);
  await Faculty.findByIdAndDelete(id);

  res.status(200).json({ message: "Faculty deleted successfully" });
});

/**
 * GET FACULTY DASHBOARD (FACULTY)
 */
export const getFacultyDashboard = asyncHandler(async (req, res) => {
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
      course: mentor.courseId,
      year: mentor.year,
      semester: mentor.semester,
      section: mentor.section,
    };
  }

  /* =========================
     HOSTEL LEAVES (WARDEN ONLY)
  ========================= */
  let pendingLeaves = 0;
  if (faculty.facultyType && faculty.facultyType.includes("WARDEN")) {
    const hostels = await Hostel.find({
      institutionId: req.user.institutionId,
      wardenId: faculty._id
    });

    const hostelIds = hostels.map(h => h._id);

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
});
