import Notice from "../models/Notice.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * CREATE NOTICE (ADMIN / FACULTY)
 */
export const createNotice = asyncHandler(async (req, res) => {
  const { title, message, targetAudience, targetHostelId, targetBusId, targetClubId, expiresAt } = req.body;

  if (!title || !message) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(400).json({ message: "Title and message are required" });
  }

  const audience = targetAudience ? (Array.isArray(targetAudience) ? targetAudience : [targetAudience]) : ["ALL"];

  let attachment = { url: null, publicId: null };
  if (req.file) {
    attachment.url = req.file.path;
    attachment.publicId = req.file.filename;
  }

  let notice;
  try {
    notice = await Notice.create({
      institutionId: req.user.institutionId,
      title,
      message,
      attachment,
      targetAudience: audience,
      targetHostelId,
      targetBusId,
      targetClubId,
      postedBy: req.user.userId,
      expiresAt
    });
  } catch (dbError) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    throw dbError;
  }

  res.status(201).json({ message: "Notice created successfully", notice });
});

/**
 * UPDATE NOTICE
 */
export const updateNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notice = await Notice.findById(id);
  if (!notice || notice.institutionId.toString() !== req.user.institutionId.toString()) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(404).json({ message: "Notice not found" });
  }

  const updateData = { ...req.body };

  if (req.file) {
    if (notice.attachment && notice.attachment.publicId) {
      await deleteFromCloudinary(notice.attachment.publicId);
    }
    updateData.attachment = {
      url: req.file.path,
      publicId: req.file.filename
    };
  }

  const updatedNotice = await Notice.findByIdAndUpdate(id, updateData, { new: true });
  res.json({ message: "Notice updated successfully", notice: updatedNotice });
});

/**
 * DELETE NOTICE
 */
export const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notice = await Notice.findById(id);
  if (!notice || notice.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(404).json({ message: "Notice not found" });
  }

  if (notice.attachment && notice.attachment.publicId) {
    await deleteFromCloudinary(notice.attachment.publicId);
  }

  await Notice.findByIdAndDelete(id);
  res.json({ message: "Notice deleted successfully" });
});

/**
 * ARCHIVE NOTICE (ADMIN)
 */
export const archiveNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notice = await Notice.findById(id);
  if (!notice || notice.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(404).json({ message: "Notice not found" });
  }

  notice.isArchived = true;
  await notice.save();
  res.json({ message: "Notice archived successfully" });
});

/**
 * GET NOTICES (ROLE-BASED VISIBILITY)
 */
export const getNotices = asyncHandler(async (req, res) => {
  const { search, archived } = req.query;

  let filter = {
    institutionId: req.user.institutionId,
    isArchived: archived === "true"
  };

  if (archived !== "true") {
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: new Date() } }
    ];
  }

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") {
  } else if (req.user.role === "FACULTY") {
    filter.targetAudience = { $in: ["ALL", "FACULTY"] };
  } else if (req.user.role === "STUDENT") {
    const student = await Student.findOne({ userId: req.user.userId });

    const audienceMatch = ["ALL", "STUDENT"];
    if (student) {
      if (student.hostelId) audienceMatch.push("HOSTELLERS");
      if (student.busId) audienceMatch.push("BUS_USERS");
      if (student.clubs && student.clubs.length > 0) audienceMatch.push("CLUB_MEMBERS");
    }

    const studentFilter = {
      $or: [
        { targetAudience: { $in: audienceMatch }, targetHostelId: null, targetBusId: null, targetClubId: null }
      ]
    };

    if (student) {
      if (student.hostelId) studentFilter.$or.push({ targetHostelId: student.hostelId });
      if (student.busId) studentFilter.$or.push({ targetBusId: student.busId });
      if (student.clubs && student.clubs.length > 0) studentFilter.$or.push({ targetClubId: { $in: student.clubs } });
    }

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: studentFilter.$or }];
      delete filter.$or;
    } else {
      filter.$or = studentFilter.$or;
    }
  }

  const notices = await Notice.find(filter)
    .sort({ createdAt: -1 })
    .populate("postedBy", "name role");

  res.json({ notices });
});
