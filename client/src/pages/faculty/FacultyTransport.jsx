import { useEffect, useState } from "react";
import { Bus, Navigation, Circle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LiveBusMap from "../../components/student/LiveBusMap";
import { useSocket } from "../../context/SocketContext";
import api from "../../services/api";

const STATUS_CLS = {
  ACTIVE: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  PAUSED: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
  IDLE:   "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

export default function FacultyTransport() {
  const { isConnected } = useSocket();
  const [buses, setBuses]       = useState([]);
  const [selected, setSelected] = useState(null); // bus object
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState(null);

  const fetchBuses = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      // Active buses first, then fall back to all buses for this institution
      const [activeRes, allRes] = await Promise.allSettled([
        api.get("/transport/buses/active"),
        api.get("/transport/buses")
      ]);

      const activeBuses = activeRes.status === "fulfilled"
        ? (activeRes.value.data.buses || [])
        : [];
      const allBuses = allRes.status === "fulfilled"
        ? (allRes.value.data.buses || [])
        : [];

      // Merge: active buses first, then rest
      const activeIds = new Set(activeBuses.map(b => b._id?.toString()));
      const rest = allBuses.filter(b => !activeIds.has(b._id?.toString()));
      const merged = [...activeBuses, ...rest];

      setBuses(merged);
      // Auto-select the first active bus, or first bus overall
      if (!selected && merged.length > 0) setSelected(merged[0]);
    } catch (err) {
      setError("Failed to load bus data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBuses(); }, []);

  const isActive = (b) => b?.tripStatus === "ACTIVE";

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
        </div>
        <div className="h-[500px] bg-slate-100 dark:bg-slate-800 rounded-2xl" />
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
              <Bus className="text-blue-600 h-9 w-9" /> Transport Tracking
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Monitor live bus locations across all routes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              isConnected
                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400"
            }`}>
              {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {isConnected ? "Live" : "Offline"}
            </span>
            <button
              onClick={() => fetchBuses(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 text-sm font-medium">
            {error}
          </div>
        )}

        {buses.length === 0 ? (
          <div className="text-center py-20">
            <Bus className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-xl font-black text-slate-500 dark:text-slate-400">No buses found</h2>
            <p className="text-slate-400 dark:text-slate-500 mt-2 text-sm">
              No buses are registered for this institution yet.
            </p>
          </div>
        ) : (
          <>
            {/* Bus selector grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {buses.map(bus => (
                <button
                  key={bus._id}
                  onClick={() => setSelected(bus)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                    selected?._id === bus._id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      Bus {bus.busNumber}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      STATUS_CLS[bus.tripStatus] || STATUS_CLS.IDLE
                    }`}>
                      {isActive(bus) && <Circle className="h-2 w-2 fill-current animate-pulse" />}
                      {bus.tripStatus || "IDLE"}
                    </span>
                  </div>
                  {bus.routeId?.routeName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 truncate">
                      <Navigation className="h-3 w-3 shrink-0" />
                      {bus.routeId.routeName}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Selected bus map */}
            {selected && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Bus {selected.busNumber} — Live Tracking
                </h2>
                <LiveBusMap
                  key={selected._id}     /* remount on bus switch */
                  busId={selected._id}
                  isDriver={false}
                  height={460}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
