import Route from "../models/Route.js";
import Bus from "../models/Bus.js";
import Driver from "../models/Driver.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET ALL ROUTES (ADMIN)
 */
export const getRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find({
    institutionId: req.user.institutionId
  }).sort({ createdAt: -1 });

  res.json({ routes });
});

/**
 * GET ALL DRIVERS (ADMIN)
 */
export const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find({
    institutionId: req.user.institutionId
  })
    .populate("userId", "name email")
    .populate("assignedBusId", "busNumber routeId")
    .sort({ createdAt: -1 });

  res.json({ drivers });
});

/**
 * ADMIN → CREATE ROUTE
 */
export const createRoute = asyncHandler(async (req, res) => {
  const { routeName, stops } = req.body;

  if (!routeName || !Array.isArray(stops) || stops.length < 2) {
    return res.status(400).json({
      message: "Route name and at least 2 stops required"
    });
  }

  const formattedStops = stops.map((stop, index) => ({
    name: stop.name,
    lat: stop.lat,
    lng: stop.lng,
    order: index + 1
  }));

  const route = await Route.create({
    institutionId: req.user.institutionId,
    routeName,
    stops: formattedStops
  });

  res.status(201).json({
    message: "Route created successfully",
    route
  });
});

/**
 * ADMIN → CREATE BUS
 */
export const createBus = asyncHandler(async (req, res) => {
  const { busNumber, routeId, capacity } = req.body;

  if (!busNumber || !routeId || !capacity) {
    return res.status(400).json({
      message: "Bus number, route, and capacity are required"
    });
  }

  if (capacity < 1) {
    return res.status(400).json({
      message: "Capacity must be at least 1"
    });
  }

  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({ message: "Route not found" });
  }

  if (route.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(403).json({ message: "Unauthorized to use this route" });
  }

  const existingBus = await Bus.findOne({
    busNumber,
    institutionId: req.user.institutionId
  });

  if (existingBus) {
    return res.status(400).json({ message: "Bus with this number already exists" });
  }

  const bus = await Bus.create({
    institutionId: req.user.institutionId,
    busNumber,
    routeId,
    capacity
  });

  res.status(201).json({
    message: "Bus created successfully",
    busId: bus._id,
    bus
  });
});

/**
 * ADMIN → CREATE DRIVER (via transport routes)
 * Delegates to the canonical createDriver in driver.controller.js.
 * Kept here so /api/transport/drivers POST still works.
 */
export const createDriver = asyncHandler(async (req, res) => {
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

  const hashed = await bcrypt.hash(password, 10);

  // Always save with canonical role "DRIVER"
  const user = await User.create({
    name,
    email,
    password: hashed,
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
});

/**
 * GET BUS BY NUMBER (STUDENT / FACULTY)
 */
export const getBusByNumber = asyncHandler(async (req, res) => {
  const { busNumber } = req.params;

  const bus = await Bus.findOne({
    busNumber,
    institutionId: req.user.institutionId
  })
    .populate("routeId")
    .populate("driverId");

  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  res.json({ bus });
});

/**
 * GET ALL BUSES (ADMIN)
 */
export const getBuses = asyncHandler(async (req, res) => {
  const buses = await Bus.find({
    institutionId: req.user.institutionId
  })
    .populate("routeId", "routeName stops")
    .sort({ createdAt: -1 });

  res.json({ buses });
});

/**
 * ADMIN → DELETE ROUTE
 */
export const deleteRoute = asyncHandler(async (req, res) => {
  const { routeId } = req.params;

  const route = await Route.findById(routeId);

  if (!route) {
    return res.status(404).json({ message: "Route not found" });
  }

  if (route.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const busWithRoute = await Bus.findOne({ routeId });
  if (busWithRoute) {
    return res.status(400).json({ message: "Cannot delete route that is assigned to a bus" });
  }

  await Route.findByIdAndDelete(routeId);

  res.json({ message: "Route deleted successfully" });
});

/**
 * ADMIN → DELETE BUS
 */
export const deleteBus = asyncHandler(async (req, res) => {
  const { busId } = req.params;

  const bus = await Bus.findById(busId);

  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  if (bus.institutionId.toString() !== req.user.institutionId.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await Bus.findByIdAndDelete(busId);

  res.json({ message: "Bus deleted successfully" });
});

/**
 * UNASSIGN BUS FROM DRIVER (ADMIN)
 */
export const unassignBusFromDriver = asyncHandler(async (req, res) => {
  const { driverId } = req.params;

  const driver = await Driver.findOne({ _id: driverId, institutionId: req.user.institutionId });
  if (!driver) return res.status(404).json({ message: "Driver not found" });
  if (!driver.assignedBusId) return res.status(400).json({ message: "Driver has no assigned bus" });

  const bus = await Bus.findById(driver.assignedBusId);
  if (bus) {
    bus.driverId = null;
    await bus.save();
  }

  driver.assignedBusId = null;
  await driver.save();

  res.json({ message: "Bus unassigned from driver successfully" });
});

/**
 * GET BUS BY ID (DRIVER / STUDENT / ADMIN)
 * Used by LiveBusMap to load route + current location for a known bus _id.
 */
export const getBusById = asyncHandler(async (req, res) => {
  const { busId } = req.params;

  const bus = await Bus.findOne({
    _id: busId,
    institutionId: req.user.institutionId
  })
    .populate("routeId", "routeName stops")
    .populate("driverId", "name phone");

  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  res.json({ bus });
});

/**
 * GET ALL ACTIVE BUSES (ADMIN / FACULTY)
 * Returns buses currently on an ACTIVE trip with their live location.
 */
export const getActiveBuses = asyncHandler(async (req, res) => {
  const buses = await Bus.find({
    institutionId: req.user.institutionId,
    tripStatus: "ACTIVE"
  })
    .populate("routeId", "routeName stops")
    .populate("driverId", "name phone")
    .lean();

  res.json({ buses });
});

/**
 * DRIVER → START TRIP
 */
export const startTrip = asyncHandler(async (req, res) => {
  const driver = await (await import("../models/Driver.js")).default.findOne({
    userId: req.user.userId,
    institutionId: req.user.institutionId
  });
  if (!driver || !driver.assignedBusId) {
    return res.status(400).json({ message: "No bus assigned to this driver" });
  }

  const bus = await Bus.findById(driver.assignedBusId);
  if (!bus) return res.status(404).json({ message: "Bus not found" });

  if (bus.tripStatus === "ACTIVE") {
    return res.status(400).json({ message: "Trip already active" });
  }

  bus.tripStatus    = "ACTIVE";
  bus.tripStartedAt = new Date();
  bus.tripEndedAt   = null;
  await bus.save();

  // Broadcast trip start to all bus-room listeners
  const { getIo } = await import("../utils/socket.js");
  try {
    getIo().to(`bus_${bus._id}`).emit("trip:start", {
      busId: bus._id,
      tripStartedAt: bus.tripStartedAt
    });
  } catch (_) { /* socket may not be init in test env */ }

  res.json({ message: "Trip started", tripStatus: bus.tripStatus, tripStartedAt: bus.tripStartedAt });
});

/**
 * DRIVER → PAUSE TRIP
 */
export const pauseTrip = asyncHandler(async (req, res) => {
  const driver = await (await import("../models/Driver.js")).default.findOne({
    userId: req.user.userId,
    institutionId: req.user.institutionId
  });
  if (!driver?.assignedBusId) return res.status(400).json({ message: "No bus assigned" });

  const bus = await Bus.findById(driver.assignedBusId);
  if (!bus) return res.status(404).json({ message: "Bus not found" });
  if (bus.tripStatus !== "ACTIVE") return res.status(400).json({ message: "Trip is not active" });

  bus.tripStatus = "PAUSED";
  await bus.save();

  const { getIo } = await import("../utils/socket.js");
  try { getIo().to(`bus_${bus._id}`).emit("trip:pause", { busId: bus._id }); } catch (_) {}

  res.json({ message: "Trip paused", tripStatus: bus.tripStatus });
});

/**
 * DRIVER → RESUME TRIP
 */
export const resumeTrip = asyncHandler(async (req, res) => {
  const driver = await (await import("../models/Driver.js")).default.findOne({
    userId: req.user.userId,
    institutionId: req.user.institutionId
  });
  if (!driver?.assignedBusId) return res.status(400).json({ message: "No bus assigned" });

  const bus = await Bus.findById(driver.assignedBusId);
  if (!bus) return res.status(404).json({ message: "Bus not found" });
  if (bus.tripStatus !== "PAUSED") return res.status(400).json({ message: "Trip is not paused" });

  bus.tripStatus = "ACTIVE";
  await bus.save();

  const { getIo } = await import("../utils/socket.js");
  try { getIo().to(`bus_${bus._id}`).emit("trip:resume", { busId: bus._id }); } catch (_) {}

  res.json({ message: "Trip resumed", tripStatus: bus.tripStatus });
});

/**
 * DRIVER → END TRIP
 */
export const endTrip = asyncHandler(async (req, res) => {
  const driver = await (await import("../models/Driver.js")).default.findOne({
    userId: req.user.userId,
    institutionId: req.user.institutionId
  });
  if (!driver?.assignedBusId) return res.status(400).json({ message: "No bus assigned" });

  const bus = await Bus.findById(driver.assignedBusId);
  if (!bus) return res.status(404).json({ message: "Bus not found" });
  if (bus.tripStatus === "IDLE" || bus.tripStatus === "ENDED") {
    return res.status(400).json({ message: "No active trip to end" });
  }

  bus.tripStatus  = "IDLE";
  bus.tripEndedAt = new Date();
  await bus.save();

  const { getIo } = await import("../utils/socket.js");
  try {
    getIo().to(`bus_${bus._id}`).emit("trip:end", {
      busId: bus._id,
      tripEndedAt: bus.tripEndedAt
    });
  } catch (_) {}

  res.json({ message: "Trip ended", tripStatus: bus.tripStatus, tripEndedAt: bus.tripEndedAt });
});
