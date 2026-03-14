import User from "../models/User.js";
import Driver from "../models/Driver.js";
import bcrypt from "bcryptjs";
import Bus from "../models/Bus.js";
import Route from "../models/Route.js";


export const createDriver = async (req, res) => {
  try {
    const { name, email, password, phone, licenseNumber } = req.body;

    if (!name || !email || !password || !phone || !licenseNumber) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "DRIVER",
      institutionId: req.user.institutionId
    });

    const driver = await Driver.create({
      userId: user._id,
      institutionId: req.user.institutionId,
      name,
      phone,
      licenseNumber
    });

    res.status(201).json({
      message: "Driver created successfully",
      driverId: driver._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignBusToDriver = async (req, res) => {
  try {
    const { driverId, busId } = req.body;

    if (!driverId || !busId) {
      return res.status(400).json({
        message: "Driver and Bus are required"
      });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // ❌ Prevent multiple drivers on same bus
    if (bus.driverId) {
      return res.status(400).json({
        message: "Bus already assigned to a driver"
      });
    }

    // ❌ Prevent driver having multiple buses
    if (driver.assignedBusId) {
      return res.status(400).json({
        message: "Driver already assigned to a bus"
      });
    }

    // ✅ Assign
    driver.assignedBusId = bus._id;
    bus.driverId = driver._id;

    await driver.save();
    await bus.save();

    res.json({
      message: "Bus assigned to driver successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getDriverDashboard = async (req, res) => {
  try {
    // First try to find as a Driver (legacy DRIVER role)
    let driver = await Driver.findOne({
      userId: req.user.userId
    }).populate({
      path: "assignedBusId",
      populate: {
        path: "routeId",
        model: "Route"
      }
    });

    // If not found, try to find as TRANSPORT_MANAGER faculty
    if (!driver && req.user.role === "FACULTY") {
      // For TRANSPORT_MANAGER faculty, get bus directly from User's institution
      const User = require("../models/User.js").default;
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Find any bus assigned to this transport manager's institution
      // Or get the first bus in their institution
      const Bus = require("../models/Bus.js").default;
      const bus = await Bus.findOne({
        institutionId: user.institutionId
      }).populate({
        path: "routeId",
        model: "Route"
      });

      return res.json({
        driver: {
          name: user.name,
          phone: user.email || "N/A",
          licenseNumber: "TRANSPORT_MANAGER"
        },
        bus: bus || null
      });
    }

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found"
      });
    }

    res.json({
      driver: {
        name: driver.name,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber
      },
      bus: driver.assignedBusId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};