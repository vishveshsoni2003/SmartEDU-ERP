import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { Bus, MapPin, Circle, Wifi, WifiOff, Clock } from "lucide-react";
import api from "../../services/api";

const STATUS_STYLE = {
  ACTIVE: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  PAUSED: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
  IDLE:   "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
  ENDED:  "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
};

/**
 * LiveBus — compact bus status card for the student dashboard.
 * Shows trip status, last known location timestamp, route name.
 * Real-time updates via Socket.io.
 */
export default function LiveBus({ busId }) {
  const { socket, isConnected } = useSocket();
  const [bus, setBus]           = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading]   = useState(true);

  // Load bus details on mount
  useEffect(() => {
    if (!busId) { setLoading(false); return; }
    api.get(`/transport/buses/${busId}`)
      .then(r => {
        setBus(r.data.bus);
        if (r.data.bus?.currentLocation?.updatedAt) {
          setLastUpdate(new Date(r.data.bus.currentLocation.updatedAt));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [busId]);

  // Join socket room and listen for live updates
  useEffect(() => {
    if (!busId || !socket) return;
    socket.emit("joinBus", busId);

    socket.on("bus:location:update", (data) => {
      setLastUpdate(new Date(data.updatedAt));
    });

    socket.on("trip:start",  () => setBus(b => b ? { ...b, tripStatus: "ACTIVE" } : b));
    socket.on("trip:pause",  () => setBus(b => b ? { ...b, tripStatus: "PAUSED" } : b));
    socket.on("trip:resume", () => setBus(b => b ? { ...b, tripStatus: "ACTIVE" } : b));
    socket.on("trip:end",    () => setBus(b => b ? { ...b, tripStatus: "IDLE"   } : b));

    return () => {
      socket.emit("leaveBus", busId);
      socket.off("bus:location:update");
      socket.off("trip:start");
      socket.off("trip:pause");
      socket.off("trip:resume");
      socket.off("trip:end");
    };
  }, [busId, socket]);

  if (loading) return (
    <div className="animate-pulse space-y-3">
      <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
    </div>
  );

  if (!bus) return (
    <div className="text-center py-8">
      <Bus className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No bus assigned to your profile.</p>
    </div>
  );

  const tripStatus = bus.tripStatus || "IDLE";
  const statusCls  = STATUS_STYLE[tripStatus] || STATUS_STYLE.IDLE;

  return (
    <div className="space-y-4">
      {/* Bus + status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
            <Bus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Bus {bus.busNumber}</p>
            {bus.routeId?.routeName && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {bus.routeId.routeName}
              </p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusCls}`}>
          {tripStatus === "ACTIVE" && <Circle className="h-2 w-2 fill-current animate-pulse" />}
          {tripStatus}
        </span>
      </div>

      {/* Connection + last update */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className={`flex items-center gap-1 font-semibold ${isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {isConnected ? "Live" : "Offline"}
        </span>
        {lastUpdate && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Capacity info */}
      {bus.capacity && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Capacity: {bus.capacity} seats
        </p>
      )}

      {tripStatus === "IDLE" && (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          Bus has not started its trip yet.
        </p>
      )}
    </div>
  );
}
