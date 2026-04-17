import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LiveBusMap from "../../components/student/LiveBusMap";
import toast from "react-hot-toast";
import {
  Bus, Users, MapPin, Award, Navigation, Phone,
  Play, Pause, Square, Circle, Wifi, WifiOff,
  Clock, AlertCircle
} from "lucide-react";

/* ── Trip status badge ────────────────────────────────── */
const TRIP_STYLES = {
  IDLE:   { cls: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",   label: "Idle" },
  ACTIVE: { cls: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400", label: "Active" },
  PAUSED: { cls: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",   label: "Paused" },
  ENDED:  { cls: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",   label: "Ended" },
};

function TripBadge({ status }) {
  const s = TRIP_STYLES[status] || TRIP_STYLES.IDLE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${s.cls}`}>
      {status === "ACTIVE" && <Circle className="h-2.5 w-2.5 fill-current animate-pulse" />}
      {s.label}
    </span>
  );
}

/* ── Small stat card ──────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{value ?? "—"}</h3>
        </div>
        {Icon && <Icon className={`w-7 h-7 opacity-70 ${color}`} />}
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const { socket, isConnected } = useSocket();

  const [driver, setDriver]     = useState(null);
  const [bus, setBus]           = useState(null);
  const [route, setRoute]       = useState(null);
  const [tripStatus, setTrip]   = useState("IDLE");
  const [loading, setLoading]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationError, setLocError]  = useState(null);
  const [gpsWorking, setGpsWorking]   = useState(false);

  // Interval ref so we can clear it cleanly
  const intervalRef = useRef(null);

  /* ── Load dashboard data ──────────────────────────── */
  const loadDashboard = useCallback(async () => {
    try {
      const res = await api.get("/drivers/dashboard");
      setDriver(res.data.driver);
      const b = res.data.bus;
      setBus(b);
      if (b?.routeId) setRoute(b.routeId);
      setTrip(b?.tripStatus ?? "IDLE");
    } catch (err) {
      // No bus assigned yet — that's fine
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  /* ── Join socket bus room ─────────────────────────── */
  useEffect(() => {
    if (!bus?._id || !socket) return;
    socket.emit("joinBus", bus._id);
    return () => socket.emit("leaveBus", bus._id);
  }, [bus?._id, socket]);

  /* ── GPS send loop — active only when trip is ACTIVE ─ */
  const sendLocation = useCallback(() => {
    if (!bus?._id || !socket || !isConnected) return;
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        socket.emit("bus:location", {
          busId:   bus._id,
          lat:     pos.coords.latitude,
          lng:     pos.coords.longitude,
          speed:   pos.coords.speed   ?? null,
          heading: pos.coords.heading ?? null
        });
        setLastUpdated(new Date());
        setGpsWorking(true);
        setLocError(null);
      },
      (err) => {
        setLocError(`GPS error: ${err.message}`);
        setGpsWorking(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [bus?._id, socket, isConnected]);

  useEffect(() => {
    if (tripStatus === "ACTIVE") {
      sendLocation();                            // immediate first send
      intervalRef.current = setInterval(sendLocation, 6000); // every 6s
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tripStatus, sendLocation]);

  /* ── Trip controls ────────────────────────────────── */
  const tripAction = async (action) => {
    try {
      const res = await api.post(`/transport/trip/${action}`);
      const newStatus = res.data.tripStatus;
      setTrip(newStatus);
      setBus(prev => prev ? { ...prev, tripStatus: newStatus } : prev);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} trip`);
    }
  };

  /* ── Loading skeleton ─────────────────────────────── */
  if (loading) return (
    <DashboardLayout>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    </DashboardLayout>
  );

  /* ── No bus assigned state ────────────────────────── */
  if (!bus) return (
    <DashboardLayout>
      <div className="text-center py-24">
        <Bus className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-2xl font-black text-slate-700 dark:text-slate-300">No Bus Assigned</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
          Your admin needs to assign a bus to your driver profile before you can start trips.
        </p>
      </div>
    </DashboardLayout>
  );

  const canStart   = tripStatus === "IDLE"   || tripStatus === "ENDED";
  const canPause   = tripStatus === "ACTIVE";
  const canResume  = tripStatus === "PAUSED";
  const canEnd     = tripStatus === "ACTIVE" || tripStatus === "PAUSED";
  const isLive     = tripStatus === "ACTIVE";

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Driver Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage your bus, track your route, and share live location.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TripBadge status={tripStatus} />
            {/* Socket status pill */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              isConnected
                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400"
            }`}>
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? "Connected" : "Offline"}
            </span>
          </div>
        </div>

        {/* ── Stats grid ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Bus Number"  value={bus.busNumber}                        icon={Bus}        color="text-blue-600 dark:text-blue-400" />
          <StatCard label="Route"       value={route?.routeName ?? "Not assigned"}   icon={Navigation} color="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Capacity"    value={`${bus.capacity} seats`}              icon={Users}      color="text-purple-600 dark:text-purple-400" />
          <StatCard label="Stops"       value={route?.stops?.length ?? 0}            icon={MapPin}     color="text-amber-600 dark:text-amber-400" />
        </div>

        {/* ── Trip Controls + GPS Status ───────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Trip Controls</h2>

          {/* GPS error banner */}
          {locationError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{locationError}</p>
            </div>
          )}

          {/* Last updated */}
          {isLive && lastUpdated && (
            <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Last location sent: {lastUpdated.toLocaleTimeString()}</span>
              {gpsWorking && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block ml-1" />}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            {canStart && (
              <button
                onClick={() => tripAction("start")}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
              >
                <Play className="h-4 w-4 fill-current" />
                Start Trip
              </button>
            )}
            {canPause && (
              <button
                onClick={() => tripAction("pause")}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <Pause className="h-4 w-4 fill-current" />
                Pause Trip
              </button>
            )}
            {canResume && (
              <button
                onClick={() => tripAction("resume")}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
              >
                <Play className="h-4 w-4 fill-current" />
                Resume Trip
              </button>
            )}
            {canEnd && (
              <button
                onClick={() => tripAction("end")}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-600/20"
              >
                <Square className="h-4 w-4 fill-current" />
                End Trip
              </button>
            )}
            {tripStatus === "IDLE" && (
              <p className="text-sm text-slate-500 dark:text-slate-400 self-center">
                Press <strong>Start Trip</strong> to begin broadcasting your location.
              </p>
            )}
          </div>
        </div>

        {/* ── Driver profile ───────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Your Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
            {[
              { label: "Name",         value: driver?.name,          icon: null },
              { label: "Phone",        value: driver?.phone,         icon: Phone },
              { label: "License No.",  value: driver?.licenseNumber, icon: Award },
            ].map(row => (
              <div key={row.label} className="py-4 sm:py-0 sm:px-6 first:pt-0 first:pl-0 last:pb-0 last:pr-0">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{row.label}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{row.value || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Live Map ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Map</h2>
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Broadcasting
              </span>
            )}
          </div>
          <div className="rounded-xl overflow-hidden" style={{ height: 420 }}>
            <LiveBusMap busId={bus._id} isDriver={true} height={420} />
          </div>
        </div>

        {/* ── Route Stops ──────────────────────────────────── */}
        {route?.stops?.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Route Stops</h2>
            <div className="relative">
              {/* Vertical connector */}
              <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-3">
                {route.stops
                  .sort((a, b) => a.order - b.order)
                  .map((stop, idx, arr) => (
                    <div key={idx} className="flex items-center gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 z-10 ${
                        idx === 0 || idx === arr.length - 1
                          ? "bg-blue-600"
                          : "bg-slate-400 dark:bg-slate-600"
                      }`}>
                        {stop.order}
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{stop.name}</p>
                        {stop.lat && stop.lng && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
