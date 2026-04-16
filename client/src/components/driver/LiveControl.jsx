import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { MapPin, AlertCircle, SignalHigh, Power, Wifi } from "lucide-react";
import Card from "../ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveControl({ busId }) {
  const { socket, isConnected } = useSocket();
  const [live, setLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (!busId || !socket) return;
    socket.emit("joinBus", busId);
    return () => socket.emit("leaveBus", busId);
  }, [busId, socket]);

  useEffect(() => {
    let interval;
    if (live && busId && socket && isConnected) {
      sendLocation();
      interval = setInterval(sendLocation, 5000);
    }
    return () => clearInterval(interval);
  }, [live, busId, socket, isConnected]);

  const sendLocation = () => {
    if (!navigator.geolocation) return setLocationError("Geolocation tracking implicitly prevented.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        socket.emit("bus:location", { busId, lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLastUpdate(new Date());
        setLocationError(null);
      },
      (error) => setLocationError(`Error: ${error.message}`)
    );
  };

  return (
    <Card shadow="md" padding="lg" className="relative overflow-hidden w-full transition-all">
      <div className={`absolute -right-10 -top-10 w-40 h-40 blur-3xl opacity-20 dark:opacity-10 pointer-events-none rounded-full ${live ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <SignalHigh className={`${live ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} /> Active Telemetry
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Configure continuous coordinate broadcasting globally.</p>
        </div>
      </div>

      <AnimatePresence>
        {locationError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{locationError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
          <div className="relative">
            <div className={`w-4 h-4 rounded-full shadow-inner ${live ? "bg-rose-500" : "bg-emerald-500"}`}></div>
            {live && <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-50"></div>}
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900 dark:text-white">{live ? "Transmission Engaged" : "Signal Dormant"}</p>
            <p className="text-xs text-slate-500 font-semibold">{live ? `Last push: ${lastUpdate ? lastUpdate.toLocaleTimeString() : 'Awaiting...'}` : "Ready to broadcast vectors"}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-200/50 dark:bg-slate-800 text-xs font-bold rounded flex-shrink-0 text-slate-700 dark:text-slate-300">
            <Wifi size={12} className={isConnected ? "text-emerald-500" : "text-rose-500"} />
            {isConnected ? "SOCKET OK" : "NO UPLINK"}
          </div>
        </div>

        <button
          onClick={() => setLive(!live)}
          disabled={!isConnected}
          className={`w-full py-4 text-white font-bold tracking-wide rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-101 disabled:opacity-50 disabled:hover:scale-100 ${live ? "bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20"
            }`}
        >
          {live ? <Power className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
          {live ? "TERINATE SIGNAL" : "INITIATE TRANSMISSION"}
        </button>
      </div>
    </Card>
  );
}
