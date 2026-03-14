import HostelLeave from "../models/HostelLeave.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Hostel from "../models/Hostel.js";

/**
 * STUDENT → APPLY LEAVE
 */
export const applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    const student = await Student.findOne({
      userId: req.user.userId,
      institutionId: req.user.institutionId
    });

    if (!student || !student.hostelId) {
      return res.status(400).json({
        message: "Hostel student not found"
      });
    }

    const leave = await HostelLeave.create({
      institutionId: req.user.institutionId,
      studentId: student._id,
      hostelId: student.hostelId,
      fromDate,
      toDate,
      reason
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leaveId: leave._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * WARDEN → VIEW PENDING LEAVES
 */
export const getPendingLeaves = async (req, res) => {
  try {
    // Get the current faculty member
    const faculty = await Faculty.findOne({
      userId: req.user.userId,
      institutionId: req.user.institutionId
    });

    if (!faculty || !faculty.facultyType.includes("WARDEN")) {
      return res.status(403).json({
        message: "Only wardens can view hostel leave requests"
      });
    }

    // Find hostels where this faculty is the warden
    const hostels = await Hostel.find({
      institutionId: req.user.institutionId,
      wardenId: faculty._id
    });

    // If no hostels assigned, return empty array
    if (hostels.length === 0) {
      return res.json({ leaves: [] });
    }

    const hostelIds = hostels.map(h => h._id);

    // Get pending leaves for those hostels
    const leaves = await HostelLeave.find({
      institutionId: req.user.institutionId,
      hostelId: { $in: hostelIds },
      status: "PENDING"
    })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name email" }
      })
      .populate("hostelId")
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (error) {
    console.error("Error in getPendingLeaves:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * WARDEN → APPROVE / REJECT LEAVE
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const faculty = await Faculty.findOne({
      userId: req.user.userId,
      institutionId: req.user.institutionId
    });

    if (!faculty) {
      return res.status(403).json({
        message: "Faculty profile not found"
      });
    }

    const leave = await HostelLeave.findOne({
      _id: leaveId,
      institutionId: req.user.institutionId
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // Check if leave is still pending
    if (leave.status !== "PENDING") {
      return res.status(400).json({
        message: `This request has already been ${leave.status.toLowerCase()}`
      });
    }

    leave.status = status;
    leave.approvedBy = faculty._id;

    if (status === "REJECTED" && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    console.log(`Leave ${leaveId} ${status.toLowerCase()} by ${faculty._id}`);

    res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave
    });
  } catch (error) {
    console.error("Error in updateLeaveStatus:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * STUDENT → VIEW OWN REQUESTS
 */
export const getMyRequests = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.userId,
      institutionId: req.user.institutionId
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const requests = await HostelLeave.find({
      studentId: student._id,
      institutionId: req.user.institutionId
    })
      .populate("hostelId")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
