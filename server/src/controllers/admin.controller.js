import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Course from "../models/Course.js";
import Bus from "../models/Bus.js";

export const getAdminStats = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;

    const [
      students,
      faculty,
      courses,
      buses
    ] = await Promise.all([
      Student.countDocuments({ institutionId }),
      Faculty.countDocuments({ institutionId }),
      Course.countDocuments({ institutionId }),
      Bus.countDocuments({ institutionId })
    ]);

    res.json({
      students,
      faculty,
      courses,
      buses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE SUB ADMIN (INSTITUTION ADMIN)
 */

export const createInstitutionAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "SUB_ADMIN",
      institutionId: req.user.institutionId
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ADMINS OF OWN INSTITUTION
 */
export const getInstitutionAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      institutionId: req.user.institutionId,
      role: { $in: ["ADMIN", "SUB_ADMIN"] }
    }).select("-password");

    res.json({ admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * TOGGLE ADMIN ACTIVE STATUS
 * Prevents deactivated admins from performing any actions (protect middleware enforces this).
 */
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deactivation
    if (id === req.user.userId) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    const user = await User.findOne({
      _id: id,
      institutionId: req.user.institutionId,
      role: { $in: ["ADMIN", "SUB_ADMIN"] }
    });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Admin ${user.isActive ? "activated" : "deactivated"} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
