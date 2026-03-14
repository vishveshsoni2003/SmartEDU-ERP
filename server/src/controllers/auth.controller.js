import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Institution from "../models/Institution.js";
import Faculty from "../models/Faculty.js";

/**
 * REGISTER
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, institutionCode } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let institutionId = null;

    // Institution required ONLY for non-super-admin users
    if (role !== "SUPER_ADMIN") {
      if (!institutionCode) {
        return res.status(400).json({
          message: "Institution code is required",
        });
      }

      const institution = await Institution.findOne({ code: institutionCode });
      if (!institution) {
        return res.status(404).json({ message: "Institution not found" });
      }

      institutionId = institution._id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      institutionId, // null for SUPER_ADMIN
    });

    return res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        institutionId: user.institutionId || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Build user response object
    const userResponse = {
      id: user._id,
      name: user.name,
      role: user.role,
    };

    // If FACULTY, fetch facultyType
    if (user.role === "FACULTY") {
      const faculty = await Faculty.findOne({ userId: user._id });
      if (faculty) {
        userResponse.facultyType = faculty.facultyType;
      }
    }

    return res.json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
