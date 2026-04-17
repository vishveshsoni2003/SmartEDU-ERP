import Hostel from "../models/Hostel.js";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * CREATE HOSTEL (ADMIN)
 */
export const createHostel = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: "Name and type are required" });
  }

  const hostel = await Hostel.create({
    institutionId: req.user.institutionId,
    name,
    type,
  });

  res.status(201).json({
    message: "Hostel created successfully",
    hostelId: hostel._id
  });
});

/**
 * ADD ROOM TO HOSTEL (ADMIN)
 */
export const addRoom = asyncHandler(async (req, res) => {
  const { hostelId } = req.params;
  const { roomNumber, capacity } = req.body;

  const hostel = await Hostel.findOne({
    _id: hostelId,
    institutionId: req.user.institutionId
  });

  if (!hostel) {
    return res.status(404).json({ message: "Hostel not found" });
  }

  hostel.rooms.push({
    roomNumber,
    capacity,
    occupants: []
  });

  await hostel.save();

  res.json({ message: "Room added successfully" });
});

/**
 * ALLOCATE ROOM TO STUDENT (ADMIN)
 */
export const allocateRoom = asyncHandler(async (req, res) => {
  const { hostelId } = req.params;
  const { studentId, roomNumber } = req.body;

  const hostel = await Hostel.findOne({
    _id: hostelId,
    institutionId: req.user.institutionId
  });

  if (!hostel) {
    return res.status(404).json({ message: "Hostel not found" });
  }

  const room = hostel.rooms.find(r => r.roomNumber === roomNumber);

  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  if (room.occupants.length >= room.capacity) {
    return res.status(400).json({ message: "Room is full" });
  }

  const student = await Student.findOne({
    _id: studentId,
    institutionId: req.user.institutionId
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (student.studentType !== "HOSTELLER") {
    return res.status(400).json({
      message: "Only hosteller students can be allocated rooms"
    });
  }

  if (student.hostelId) {
    return res.status(400).json({
      message: "Student already has a hostel room"
    });
  }

  room.occupants.push(student._id);
  student.hostelId = hostel._id;
  student.roomNumber = roomNumber;

  await hostel.save();
  await student.save();

  res.json({ message: "Room allocated successfully" });
});

/**
 * DEALLOCATE ROOM FROM STUDENT (ADMIN)
 */
export const deallocateRoom = asyncHandler(async (req, res) => {
  const { hostelId, studentId } = req.params;

  const hostel = await Hostel.findOne({
    _id: hostelId,
    institutionId: req.user.institutionId
  });

  if (!hostel) {
    return res.status(404).json({ message: "Hostel not found" });
  }

  const student = await Student.findOne({
    _id: studentId,
    institutionId: req.user.institutionId
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (!student.hostelId || student.hostelId.toString() !== hostelId) {
    return res.status(400).json({ message: "Student is not allocated to this hostel" });
  }

  // Find the room and remove the occupant
  const room = hostel.rooms.find(r => r.roomNumber === student.roomNumber);
  if (room) {
    room.occupants = room.occupants.filter(occ => occ.toString() !== studentId);
  }

  student.hostelId = null;
  student.roomNumber = null;

  await hostel.save();
  await student.save();

  res.json({ message: "Student deallocated successfully" });
});

/**
 * GET HOSTELS (ADMIN / STUDENT)
 */
export const getHostels = asyncHandler(async (req, res) => {
  const dbHostels = await Hostel.find({
    institutionId: req.user.institutionId
  }).lean();

  const hostels = dbHostels.map(h => {
    const totalRooms = h.rooms?.length || 0;
    const occupiedRooms = h.rooms?.reduce((acc, r) => acc + (r.occupants?.length || 0), 0) || 0;
    return { ...h, totalRooms, occupiedRooms };
  });

  res.json({ hostels });
});

/**
 * DELETE HOSTEL (ADMIN)
 */
export const deleteHostel = asyncHandler(async (req, res) => {
  const { hostelId } = req.params;

  const hostel = await Hostel.findOne({
    _id: hostelId,
    institutionId: req.user.institutionId
  });

  if (!hostel) {
    return res.status(404).json({ message: "Hostel not found" });
  }

  const studentsInHostel = await Student.findOne({
    hostelId: hostelId
  });

  if (studentsInHostel) {
    return res.status(400).json({
      message: "Cannot delete hostel with allocated students. Please deallocate all students first."
    });
  }

  await Hostel.findByIdAndDelete(hostelId);

  res.json({ message: "Hostel deleted successfully" });
});
