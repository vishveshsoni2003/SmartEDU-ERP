import Notice from "../models/Notice.js";
import Student from "../models/Student.js";

/**
 * CREATE NOTICE (ADMIN / FACULTY)
 */
export const createNotice = async (req, res) => {
  try {
    const { title, message, targetAudience, expiresAt } = req.body;

    if (!title || !message || !targetAudience) {
      return res.status(400).json({
        message: "Title, message and target audience are required"
      });
    }

    // FACULTY restriction
    if (req.user.role === "FACULTY") {
      if (!["FACULTY", "STUDENT", "ALL"].includes(targetAudience)) {
        return res.status(403).json({
          message: "Faculty can only post for Faculty or Students"
        });
      }
    }

    const notice = await Notice.create({
      institutionId: req.user.institutionId,
      title,
      message,
      targetAudience: [targetAudience], // Convert string to array for model
      postedBy: req.user.userId,
      expiresAt
    });

    res.status(201).json({
      message: "Notice created successfully",
      notice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/**
 * GET NOTICES (ROLE-BASED VISIBILITY)
 */
export const getMyNotices = async (req, res) => {
  try {
    let filter = {
      institutionId: req.user.institutionId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } }
      ]
    };

    // 🔥 ADMIN sees EVERYTHING
    if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") {
      // no audience filter
    }

    // 🔥 FACULTY sees ALL + FACULTY + STUDENTS
    else if (req.user.role === "FACULTY") {
      filter.targetAudience = {
        $in: ["ALL", "FACULTY", "STUDENTS"]
      };
    }

    // 🔥 STUDENT sees ALL + STUDENT
    else if (req.user.role === "STUDENT") {
      filter.targetAudience = {
        $in: ["ALL", "STUDENT"]
      };
    }

    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 })
      .populate("postedBy", "name role");

    res.json({ notices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
