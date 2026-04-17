import User from "../models/User.js";
import Driver from "../models/Driver.js";
import Bus from "../models/Bus.js";
import bcrypt from "bcryptjs";

/**
 * CREATE DRIVER (ADMIN)
 * Creates a User with role=DRIVER plus a Driver profile record.
 */
export const createDriver = async (req, res) => {
  try {
    const { name, email, password, phone, licenseNumber } = req.body;

    if (!name || !email || !password || !phone || !licenseNumber) {
      return res.status(400).json({
        message: "Name, email, password, phone, and license number are all required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const existingLicense = await Driver.findOne({
      licenseNumber,
      institutionId: req.user.institutionId
    });
    if (existingLicense) {
      return res.status(400).json({ message: "License number already registered at this institution" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Always use canonical role "DRIVER"
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "DRIVER",
      institutionId: req.user.institutionId
    });

    let driver;
    try {
      driver = await Driver.create({
        userId: user._id,
        institutionId: req.user.institutionId,
        name,
        phone,
        licenseNumber
      });
    } catch (dbErr) {
      // Roll back user if Driver record creation fails
      await User.findByIdAndDelete(user._id);
      throw dbErr;
    }

    res.status(201).json({
      message: "Driver created successfully",
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE DRIVER (ADMIN)
 * Removes driver profile + linked User account. Unassigns bus first.
 */
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findOne({
      _id: id,
      institutionId: req.user.institutionId
    });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Unassign bus before deletion so Bus.driverId doesn't become a dangling ref
    if (driver.assignedBusId) {
      await Bus.findByIdAndUpdate(driver.assignedBusId, { driverId: null });
    }

    await User.findByIdAndDelete(driver.userId);
    await Driver.findByIdAndDelete(id);

    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ASSIGN BUS TO DRIVER (ADMIN)
 * 1-to-1 mapping enforced: one driver per bus, one bus per driver.
 */
export const assignBusToDriver = async (req, res) => {
  try {
    const { driverId, busId } = req.body;

    if (!driverId || !busId) {
      return res.status(400).json({ message: "Both driverId and busId are required" });
    }

    const driver = await Driver.findOne({
      _id: driverId,
      institutionId: req.user.institutionId
    });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const bus = await Bus.findOne({
      _id: busId,
      institutionId: req.user.institutionId
    });
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    if (bus.driverId) {
      return res.status(400).json({ message: "This bus is already assigned to a driver" });
    }
    if (driver.assignedBusId) {
      return res.status(400).json({ message: "This driver already has a bus assigned" });
    }

    driver.assignedBusId = bus._id;
    bus.driverId = driver._id;

    await driver.save();
    await bus.save();

    res.json({ message: "Bus assigned to driver successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET DRIVER DASHBOARD (DRIVER role only)
 */
export const getDriverDashboard = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      userId: req.user.userId
    }).populate({
      path: "assignedBusId",
      populate: { path: "routeId", model: "Route" }
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found. Ask your admin to register your driver account."
      });
    }

    res.json({
      driver: {
        name: driver.name,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber
      },
      bus: driver.assignedBusId || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
