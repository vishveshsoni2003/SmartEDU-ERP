import { Server } from "socket.io";
import Bus from "../models/Bus.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    /**
     * Any viewer (student / admin / faculty) joins a bus room to receive updates.
     */
    socket.on("joinBus", (busId) => {
      if (!busId) return;
      socket.join(`bus_${busId}`);
    });

    socket.on("leaveBus", (busId) => {
      if (!busId) return;
      socket.leave(`bus_${busId}`);
    });

    /**
     * DRIVER sends live location update.
     * Payload: { busId, lat, lng, speed?, heading? }
     * - Persists to DB
     * - Broadcasts to all viewers in the bus room
     */
    socket.on("bus:location", async ({ busId, lat, lng, speed, heading }) => {
      if (!busId || lat == null || lng == null) return;

      try {
        const now = new Date();

        await Bus.findByIdAndUpdate(busId, {
          currentLocation: { lat, lng, updatedAt: now }
        });

        // Emit to all viewers of this bus
        io.to(`bus_${busId}`).emit("bus:location:update", {
          lat,
          lng,
          speed:   speed   ?? null,
          heading: heading ?? null,
          updatedAt: now.toISOString()
        });
      } catch (err) {
        console.error("🚨 Bus location error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
