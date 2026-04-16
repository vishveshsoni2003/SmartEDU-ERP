import StudentAttendance from "../models/StudentAttendance.js";
import Hostel from "../models/Hostel.js";
import Bus from "../models/Bus.js";
import ClubApplication from "../models/ClubApplication.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET HOSTEL OCCUPANCY (ADMIN)
 */
export const getHostelOccupancyReport = asyncHandler(async (req, res) => {
    const hostels = await Hostel.find({ institutionId: req.user.institutionId });

    const report = hostels.map((hostel) => {
        let totalCapacity = 0;
        let totalOccupants = 0;

        hostel.rooms.forEach((room) => {
            totalCapacity += room.capacity;
            totalOccupants += room.occupants.length;
        });

        return {
            hostelId: hostel._id,
            name: hostel.name,
            type: hostel.type,
            totalCapacity,
            totalOccupants,
            vacancy: totalCapacity - totalOccupants,
            occupancyPercentage: totalCapacity === 0 ? 0 : ((totalOccupants / totalCapacity) * 100).toFixed(2)
        };
    });

    res.json({ report });
});

/**
 * GET BUS USAGE REPORT (ADMIN)
 */
export const getBusUsageReport = asyncHandler(async (req, res) => {
    const mongoose = (await import("mongoose")).default;
    const Student = mongoose.model("Student");

    const usageStats = await Student.aggregate([
        { $match: { institutionId: req.user.institutionId, busId: { $ne: null } } },
        { $group: { _id: "$busId", occupantCount: { $sum: 1 } } }
    ]);

    const buses = await Bus.find({ institutionId: req.user.institutionId })
        .populate("routeId", "routeName");

    const report = buses.map(bus => {
        const stat = usageStats.find(s => s._id.toString() === bus._id.toString());
        const occupantCount = stat ? stat.occupantCount : 0;

        return {
            busId: bus._id,
            busNumber: bus.busNumber,
            route: bus.routeId ? bus.routeId.routeName : "N/A",
            capacity: bus.capacity,
            occupantCount,
            vacancy: bus.capacity - occupantCount,
            usagePercentage: bus.capacity === 0 ? 0 : ((occupantCount / bus.capacity) * 100).toFixed(2)
        };
    });

    res.json({ report });
});

/**
 * PENDING APPROVALS REPORT (ADMIN)
 */
export const getPendingApprovalsReport = asyncHandler(async (req, res) => {
    // Pending Club Apps
    const clubPending = await ClubApplication.countDocuments({
        institutionId: req.user.institutionId,
        status: { $in: ["PENDING_FACULTY", "PENDING_ADMIN"] }
    });

    // Pending Hostel Leaves
    const mongoose = (await import("mongoose")).default;
    const HostelLeave = mongoose.model("HostelLeave");
    const leavePending = await HostelLeave.countDocuments({
        institutionId: req.user.institutionId,
        status: "PENDING"
    });

    res.json({
        report: {
            clubApplications: clubPending,
            hostelLeaves: leavePending,
            totalPending: clubPending + leavePending
        }
    });
});
