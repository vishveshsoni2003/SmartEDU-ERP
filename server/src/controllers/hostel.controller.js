import Hostel from "../models/Hostel.js";
import Student from "../models/Student.js";
/**
 * CREATE HOSTEL (ADMIN)
 */
export const createHostel = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADD ROOM TO HOSTEL (ADMIN)
 */
export const addRoom = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * ALLOCATE ROOM TO STUDENT (ADMIN)
 */
export const allocateRoom = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { studentId, roomNumber } = req.body;

    const hostel = await Hostel.findOne({
      _id: hostelId,
      institutionId: req.user.institutionId
    });

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    const room = hostel.rooms.find(
      (r) => r.roomNumber === roomNumber
    );

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

    // Prevent double allocation
    if (student.hostelId) {
      return res.status(400).json({
        message: "Student already has a hostel room"
      });
    }

    // Allocate
    room.occupants.push(student._id);

    student.hostelId = hostel._id;
    student.roomNumber = roomNumber;

    await hostel.save();
    await student.save();

    res.json({ message: "Room allocated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({
      institutionId: req.user.institutionId
    });

    res.json({ hostels });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE HOSTEL (ADMIN)
 */
export const deleteHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;

    const hostel = await Hostel.findOne({
      _id: hostelId,
      institutionId: req.user.institutionId
    });

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    // Check if any students are allocated to this hostel
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
