import { Server } from "socket.io";
import Bus from "../models/Bus.js";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        console.log("🟢 Socket connected:", socket.id);

        /**
         * STUDENT / ADMIN / FACULTY joins a bus room
         */
        socket.on("joinBus", (busId) => {
            if (!busId) return;
            socket.join(`bus_${busId}`);
            console.log(`Socket ${socket.id} joined bus_${busId}`);
        });

        /**
         * DRIVER sends live location
         */
        socket.on("bus:location", async ({ busId, lat, lng }) => {
            if (!busId || lat == null || lng == null) {
                return;
            }

            try {
                const bus = await Bus.findById(busId);
                if (!bus) return;

                bus.currentLocation = {
                    lat,
                    lng,
                    updatedAt: new Date(),
                };
                await bus.save();

                // Broadcast only to viewers of this bus
                io.to(`bus_${busId}`).emit("bus:location:update", {
                    lat,
                    lng,
                    updatedAt: bus.currentLocation.updatedAt,
                });

            } catch (error) {
                console.error("🚨 Bus location error:", error.message);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Socket disconnected:", socket.id);
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized!");
    }
    return io;
};
