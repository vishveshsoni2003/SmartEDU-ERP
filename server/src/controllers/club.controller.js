import Club from "../models/Club.js";
import ClubApplication from "../models/ClubApplication.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * GET CLUBS (ANY ROLE)
 */
export const getClubs = asyncHandler(async (req, res) => {
  const clubs = await Club.find({ institutionId: req.user.institutionId })
    .populate("facultyInCharge", "userId employeeId")
    .populate("members", "userId enrollmentNo rollNo");
  res.json({ clubs });
});

/**
 * ADMIN → CREATE CLUB
 */
export const createClub = asyncHandler(async (req, res) => {
  const { name, description, facultyInCharge } = req.body;

  if (!name || !description) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(400).json({ message: "Name and description required" });
  }

  let banner = { url: null, publicId: null };
  if (req.file) {
    banner.url = req.file.path;
    banner.publicId = req.file.filename;
  }

  let club;
  try {
    club = await Club.create({
      institutionId: req.user.institutionId,
      name,
      description,
      banner,
      facultyInCharge: facultyInCharge || null
    });
  } catch (dbError) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    throw dbError;
  }

  res.status(201).json({
    message: "Club created successfully",
    clubId: club._id
  });
});

/**
 * ADMIN → UPDATE CLUB
 */
export const updateClub = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const club = await Club.findById(id);
  if (!club || club.institutionId.toString() !== req.user.institutionId.toString()) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(404).json({ message: "Club not found" });
  }

  const updateData = { ...req.body };

  if (req.file) {
    if (club.banner && club.banner.publicId) {
      await deleteFromCloudinary(club.banner.publicId);
    }
    updateData.banner = {
      url: req.file.path,
      publicId: req.file.filename
    };
  }

  const updatedClub = await Club.findByIdAndUpdate(id, updateData, { new: true });
  res.json({ message: "Club updated successfully", club: updatedClub });
});

/**
 * STUDENT → APPLY CLUB
 */
export const applyToClub = asyncHandler(async (req, res) => {
  const { clubId } = req.params;

  const student = await Student.findOne({ userId: req.user.userId });
  if (!student) {
    return res.status(404).json({ message: "Student profile not found" });
  }

  const club = await Club.findById(clubId);
  if (!club || club.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(404).json({ message: "Club not found" });
  }

  const exists = await ClubApplication.findOne({
    clubId,
    studentId: student._id,
    status: { $in: ["PENDING_FACULTY", "PENDING_ADMIN"] }
  });

  if (exists) {
    return res.status(400).json({ message: "Application already pending" });
  }

  if (club.members.includes(student._id)) {
    return res.status(400).json({ message: "You are already a member" });
  }

  const application = await ClubApplication.create({
    institutionId: req.user.institutionId,
    clubId,
    studentId: student._id
  });

  res.json({ message: "Club application submitted", applicationId: application._id });
});

/**
 * GET APPLICATIONS (ADMIN/FACULTY)
 */
export const getApplications = asyncHandler(async (req, res) => {
  const { clubId } = req.query;

  let filter = { institutionId: req.user.institutionId };
  if (clubId) filter.clubId = clubId;

  // If Faculty, they typically only see applications requiring Faculty approval for their clubs
  if (req.user.role === "FACULTY") {
    const faculty = await Faculty.findOne({ userId: req.user.userId });
    if (faculty) {
      // get all clubs they manage
      const myClubs = await Club.find({ facultyInCharge: faculty._id }).select("_id");
      filter.clubId = { $in: myClubs };
    }
  }

  const applications = await ClubApplication.find(filter)
    .populate("studentId", "userId enrollmentNo rollNo")
    .populate("clubId", "name");

  res.json({ applications });
});

/**
 * FACULTY → APPROVE / REJECT
 */
export const facultyDecision = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body; // PENDING_ADMIN or REJECTED

  if (!["PENDING_ADMIN", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid decision" });
  }

  const faculty = await Faculty.findOne({ userId: req.user.userId });
  if (!faculty) return res.status(403).json({ message: "Faculty profile required" });

  const app = await ClubApplication.findById(applicationId);
  if (!app || app.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(404).json({ message: "Application not found" });
  }

  app.status = status;
  app.facultyDecisionBy = faculty._id;
  await app.save();

  res.json({ message: `Faculty decision recorded: ${status}` });
});

/**
 * ADMIN → FINAL APPROVAL
 */
export const adminDecision = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body; // APPROVED or REJECTED

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid decision" });
  }

  const app = await ClubApplication.findById(applicationId);
  if (!app || app.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(404).json({ message: "Application not found" });
  }

  app.status = status;
  app.adminDecisionBy = req.user.userId;

  if (status === "APPROVED") {
    const club = await Club.findById(app.clubId);
    const student = await Student.findById(app.studentId);

    if (!club.members.includes(app.studentId)) {
      club.members.push(app.studentId);
      await club.save();
    }

    if (!student.clubs.includes(app.clubId)) {
      student.clubs.push(app.clubId);
      await student.save();
    }
  }

  await app.save();

  res.json({ message: `Application ${status.toLowerCase()}` });
});

/**
 * ADMIN → REMOVE MEMBER
 */
export const removeMember = asyncHandler(async (req, res) => {
  const { clubId, studentId } = req.params;

  const club = await Club.findById(clubId);
  const student = await Student.findById(studentId);

  if (!club || !student) return res.status(404).json({ message: "Club or Student not found" });

  // Disconnect relations
  club.members = club.members.filter(m => m.toString() !== studentId);
  await club.save();

  student.clubs = student.clubs.filter(c => c.toString() !== clubId);
  await student.save();

  res.json({ message: "Student removed from club successfully" });
});
