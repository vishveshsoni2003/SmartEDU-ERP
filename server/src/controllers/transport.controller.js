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
 * ADMIN → CREATE DRIVER
 */
export const createDriver = asyncHandler(async (req, res) => {
  const { name, email, password, licenseNumber } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "DRIVER",
    institutionId: req.user.institutionId
  });

  const driver = await Driver.create({
    userId: user._id,
    institutionId: req.user.institutionId,
    licenseNumber
  });

  res.status(201).json({ driverId: driver._id });
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