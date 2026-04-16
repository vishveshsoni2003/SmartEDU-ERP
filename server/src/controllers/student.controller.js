import User from "../models/User.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Hostel from "../models/Hostel.js";
import Bus from "../models/Bus.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * CREATE STUDENT (ADMIN)
 */
export const createStudent = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    enrollmentNo,
    rollNo,
    studentType,
    courseId,
    year,
    semester,
    section,
    hostelId,
    roomNumber,
    busId,
    clubs        // optional — array of club IDs
  } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !enrollmentNo ||
    !rollNo ||
    !studentType ||
    !courseId ||
    !year ||
    !section
  ) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Scope enrollment uniqueness to this institution only
  const existingStudent = await Student.findOne({ enrollmentNo, institutionId: req.user.institutionId });
  if (existingStudent) {
    return res.status(400).json({ message: "Enrollment number already exists in this institution" });
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(400).json({ message: "Invalid course" });
  }

  if (studentType === "HOSTELLER" && !hostelId) {
    return res.status(400).json({ message: "Hostel is required for hosteller" });
  }
  if (studentType === "BUS_SERVICE" && !busId) {
    return res.status(400).json({ message: "Bus is required for bus service student" });
  }

  if (hostelId) {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return res.status(400).json({ message: "Invalid hostel" });
  }

  if (busId) {
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(400).json({ message: "Invalid bus" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "STUDENT",
    institutionId: req.user.institutionId
  });

  let profileImage = { url: null, publicId: null };
  if (req.file) {
    profileImage.url = req.file.path;
    profileImage.publicId = req.file.filename;
  }

  let student;
  try {
    student = await Student.create({
      userId: user._id,
      institutionId: req.user.institutionId,
      profileImage,
      enrollmentNo,
      rollNo,
      studentType,
      courseId,
      year: Number(year),
      section,
      semester: semester ? Number(semester) : undefined,
      hostelId: hostelId || null,
      roomNumber: roomNumber || null,
      busId: busId || null,
      clubs: Array.isArray(clubs) ? clubs : []
    });
  } catch (dbError) {
    // 🚨 Critical Rollback: If Mongoose fails 11000 dup key, purge the cloud image!
    if (req.file) await deleteFromCloudinary(req.file.filename);
    await User.findByIdAndDelete(user._id); // Purge the unlinked User auth
    throw dbError; // Pass down to asyncHandler
  }

  res.status(201).json({
    message: "Student created successfully",
    studentId: student._id
  });
});

/**
 * GET ALL STUDENTS (ADMIN / FACULTY)
 */
export const getAllStudents = asyncHandler(async (req, res) => {
  const { search, courseId, section, year } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  let filter = { institutionId: req.user.institutionId };

  if (search) {
    // We can't nicely search User's name directly from Student collection unless we aggregate or use regex
    // For simplicity with mongoose, we search enrollmentNo
    filter.$or = [
      { enrollmentNo: { $regex: search, $options: "i" } }
    ];
  }

  if (courseId) filter.courseId = courseId;
  if (section) filter.section = section.toUpperCase();
  if (year) filter.year = year;

  // Additional isolation if queried by Faculty (faculties might only see their subjects/sections in some logic)
  if (req.user.role === "FACULTY") {
    // Basic logic: currently faculties can view all students in their institution
  }

  const total = await Student.countDocuments(filter);
  const students = await Student.find(filter)
    .populate("userId", "name email isActive")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    students
  });
});

/**
 * GET OWN STUDENT PROFILE (STUDENT)
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user.id })
    .populate("userId", "name email phone role")
    .populate("courseId", "name code duration")
    .populate("hostelId", "name type")
    .populate("busId", "routeName busNumber");

  if (!student) {
    return res.status(404).json({ message: "Student profile not found. Please contact your admin." });
  }

  return res.status(200).json({
    student: {
      _id: student._id,
      name: student.userId?.name,
      email: student.userId?.email,
      phone: student.userId?.phone,
      enrollmentNo: student.enrollmentNo,
      rollNo: student.rollNo,
      year: student.year,
      semester: student.semester,
      section: student.section,
      studentType: student.studentType,
      profileImage: student.profileImage,
      courseId: student.courseId,
      hostelId: student.hostelId,
      busId: student.busId,
      institutionId: student.institutionId,
    }
  });
});

/**
 * UPDATE STUDENT (ADMIN)
 */
export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id);
  if (!student || student.institutionId.toString() !== req.user.institutionId.toString()) {
    // If file was uploaded but we reject request, we should clean it up
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(404).json({ message: "Student not found" });
  }

  const updateData = { ...req.body };

  if (req.file) {
    // delete old image
    if (student.profileImage && student.profileImage.publicId) {
      await deleteFromCloudinary(student.profileImage.publicId);
    }
    updateData.profileImage = {
      url: req.file.path,
      publicId: req.file.filename
    };
  }

  const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
});

/**
 * DELETE STUDENT (ADMIN)
 */
export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id);
  if (!student || student.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Delete associated image
  if (student.profileImage && student.profileImage.publicId) {
    await deleteFromCloudinary(student.profileImage.publicId);
  }

  await User.findByIdAndDelete(student.userId);
  await Student.findByIdAndDelete(id);

  res.status(200).json({ message: "Student deleted successfully" });
});
