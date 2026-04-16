import Institution from "../models/Institution.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * CREATE INSTITUTION (SUPER ADMIN)
 */
export const createInstitution = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(400).json({ message: "Name and code are required" });
  }

  const existing = await Institution.findOne({ code });
  if (existing) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(400).json({ message: "Institution code already exists" });
  }

  let logo = { url: null, publicId: null };
  if (req.file) {
    logo.url = req.file.path;
    logo.publicId = req.file.filename;
  }

  let institution;
  try {
    institution = await Institution.create({
      name,
      code,
      logo,
      status: "ACTIVE",
    });
  } catch (dbError) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    throw dbError;
  }

  res.status(201).json({ message: "Institution created successfully", institution });
});

/**
 * GET ALL INSTITUTIONS (SUPER ADMIN)
 */
export const getAllInstitutions = asyncHandler(async (req, res) => {
  const institutions = await Institution.find().sort({ createdAt: -1 });
  res.json({ institutions });
});

/**
 * UPDATE INSTITUTION STATUS (SUPER ADMIN)
 */
export const updateInstitutionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const institution = await Institution.findByIdAndUpdate(id, { status }, { new: true });
  if (!institution) return res.status(404).json({ message: "Institution not found" });

  res.json({ message: "Institution status updated", institution });
});

/**
 * UPDATE INSTITUTION
 */
export const updateInstitution = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const institution = await Institution.findById(id);
  if (!institution) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    return res.status(404).json({ message: "Institution not found" });
  }

  const updateData = { ...req.body };

  if (req.file) {
    if (institution.logo && institution.logo.publicId) {
      await deleteFromCloudinary(institution.logo.publicId);
    }
    updateData.logo = {
      url: req.file.path,
      publicId: req.file.filename
    };
  }

  const updatedInstitution = await Institution.findByIdAndUpdate(id, updateData, { new: true });
  res.json({ message: "Institution updated successfully", institution: updatedInstitution });
});

/**
 * DELETE INSTITUTION
 */
export const deleteInstitution = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const institution = await Institution.findById(id);
  if (!institution) return res.status(404).json({ message: "Institution not found" });

  if (institution.logo && institution.logo.publicId) {
    await deleteFromCloudinary(institution.logo.publicId);
  }

  await Institution.findByIdAndDelete(id);
  res.json({ message: "Institution deleted successfully" });
});
