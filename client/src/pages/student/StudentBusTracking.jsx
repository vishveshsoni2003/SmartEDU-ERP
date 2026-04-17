import { useEffect, useState } from "react";
import { Bus, Circle, Wifi, WifiOff } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LiveBusMap from "../../components/student/LiveBusMap";
import { useSocket } from "../../context/SocketContext";
import api from "../../services/api";

export default function StudentBusTracking() {
  const { socket, isConnected } = useSocket();
  const [student, setStudent]   = useState(null);
  const [bus, setBus]           = useState(null);
  const [tripStatus, setTrip]   = useState("IDLE");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await api.get("/students/me");
        const s = profileRes.data.student;
        setStudent(s);

        // Normalise busId — may be populated object or plain string
        const rawBusId = s.busId?._id || s.busId;
        if (!rawBusId) {
          setLoading(false);
          return;
        }

        const busRes = await api.get(`/transport/buses/${rawBusId}`);
        const b = busRes.data.bus;
        setBus(b);
        setTrip(b?.tripStatus ?? "IDLE");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bus data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Listen to trip status changes via socket so the badge updates live
  useEffect(() => {
    if (!bus?._id || !socket) return;
    const onStart  = () => setTrip("ACTIVE");
    const onPause  = () => setTrip("PAUSED");
    const onResume = () => setTrip("ACTIVE");
    const onEnd    = () => setTrip("IDLE");
    socket.on("trip:start",  onStart);
    socket.on("trip:pause",  onPause);
    socket.on("trip:resume", onResume);
    socket.on("trip:end",    onEnd);
    return () => {
      socket.off("trip:start",  onStart);
      socket.off("trip:pause",  onPause);
      socket.off("trip:resume", onResume);
      socket.off("trip:end",    onEnd);
    };
  }, [bus?._id, socket]);

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Bus className="text-blue-600 h-9 w-9" /> Track My Bus
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Real-time location of your assigned bus.
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            isConnected
              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400"
          }`}>
            {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 text-sm font-medium">
            {error}
          </div>
        )}

        {/* No bus assigned */}
        {!bus && !error && (
          <div className="text-center py-20">
            <Bus className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-2xl font-black text-slate-600 dark:text-slate-400">No Bus Assigned</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto text-sm">
              You are registered as a Day Scholar or Hosteller. Bus tracking is only available for Bus Service students.
            </p>
          </div>
        )}

        {bus && (
          <>
            {/* Live Map — info strip + map bundled inside LiveBusMap */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Live Location</h2>
              <LiveBusMap busId={bus._id} isDriver={false} height={440} />
            </div>

            {/* Route Stops */}
            {bus.routeId?.stops?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
                  Route Stops
                  <span className="ml-2 text-sm font-semibold text-slate-400 dark:text-slate-500">
                    ({bus.routeId.stops.length})
                  </span>
                </h2>
                <div className="relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-3">
                    {bus.routeId.stops
                      .sort((a, b) => a.order - b.order)
                      .map((stop, idx, arr) => (
                        <div key={idx} className="flex items-center gap-4 relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 z-10 ${
                            idx === 0 || idx === arr.length - 1 ? "bg-blue-600" : "bg-slate-400 dark:bg-slate-600"
                          }`}>
                            {stop.order}
                          </div>
                          <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{stop.name}</p>
                            {idx === 0 && <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 font-medium">Start</p>}
                            {idx === arr.length - 1 && <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 font-medium">End</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
