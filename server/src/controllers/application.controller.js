import Application from "../models/Application.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";

/**
 * STUDENT → SUBMIT APPLICATION
 */
export const submitApplication = async (req, res) => {
  try {
    const { type, title, description, approvalRequired } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({
        message: "Type, title, and description are required"
      });
    }

    const student = await Student.findOne({
      userId: req.user.userId,
      institutionId: req.user.institutionId
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const application = await Application.create({
      institutionId: req.user.institutionId,
      studentId: student._id,
      type,
      title,
      description,
      approvalRequired: approvalRequired || "FACULTY"
    });

    res.status(201).json({
      message: "Application submitted successfully",
      applicationId: application._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * STUDENT → VIEW OWN APPLICATIONS
 */
export const getMyApplications = async (req, res) => {
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

    const applications = await Application.find({
      studentId: student._id,
      institutionId: req.user.institutionId
    })
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * WARDEN/FACULTY → VIEW PENDING APPLICATIONS
 */
export const getPendingApplications = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      userId: req.user.userId,
      institutionId: req.user.institutionId
    });

    if (!faculty) {
      return res.status(403).json({
        message: "Faculty profile not found"
      });
    }

    // Determine what applications to show based on faculty role
    let filter = {
      institutionId: req.user.institutionId,
      status: "PENDING"
    };

    // Warden can only see hostel-related applications
    if (faculty.facultyType.includes("WARDEN")) {
      filter.approvalRequired = "WARDEN";
    } else {
      // Regular faculty see faculty-level applications
      filter.approvalRequired = "FACULTY";
    }

    const applications = await Application.find(filter)
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name email" }
      })
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * WARDEN/FACULTY → APPROVE/REJECT APPLICATION
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
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

    const application = await Application.findOne({
      _id: applicationId,
      institutionId: req.user.institutionId
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if application is still pending
    if (application.status !== "PENDING") {
      return res.status(400).json({
        message: `This application has already been ${application.status.toLowerCase()}`
      });
    }

    // Verify faculty can approve this type of application
    if (application.approvalRequired === "WARDEN" && !faculty.facultyType.includes("WARDEN")) {
      return res.status(403).json({
        message: "Only wardens can approve this application"
      });
    }

    application.status = status;
    application.approvedBy = faculty._id;

    if (status === "REJECTED" && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    res.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
