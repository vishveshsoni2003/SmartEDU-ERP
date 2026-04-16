import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Institution from "../models/Institution.js";
import Faculty from "../models/Faculty.js";
import sendEmail from "../utils/sendEmail.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateTokens = (userId, role, institutionId) => {
  const accessToken = jwt.sign(
    { userId, role, institutionId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

/**
 * REGISTER
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, institutionCode } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  let institutionId = null;

  if (role !== "SUPER_ADMIN") {
    if (!institutionCode) {
      return res.status(400).json({ message: "Institution code is required" });
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
    institutionId,
  });

  return res.status(201).json({
    message: "User registered successfully",
    userId: user._id,
  });
});

/**
 * LOGIN
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = generateTokens(
    user._id,
    user.role,
    user.institutionId || null
  );

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  const userResponse = {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId || null,
    phone: user.phone || null,
  };

  if (user.role === "FACULTY") {
    const faculty = await Faculty.findOne({ userId: user._id });
    if (faculty) {
      userResponse.facultyType = faculty.facultyType;
    }
  }

  return res.json({
    message: "Login successful",
    accessToken,
    refreshToken,
    user: userResponse,
  });
});

/**
 * LOGOUT
 */
export const logout = asyncHandler(async (req, res) => {
  const { userId } = req.body; // or extract from headers/token

  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * REFRESH TOKEN
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const user = await User.findOne({ refreshToken: token });

  if (!user) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refresh_secret");

    // Create new access token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, institutionId: user.institutionId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Access token lifetime
    );

    res.json({ accessToken });
  } catch (error) {
    user.refreshToken = null;
    await user.save();
    return res.status(403).json({ message: "Refresh token expired. Please login again" });
  }
});

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: "There is no user with that email" });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire 10 mins
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500).json({ message: "Email could not be sent" });
  }
});

/**
 * RESET PASSWORD
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Set new password
  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
});
