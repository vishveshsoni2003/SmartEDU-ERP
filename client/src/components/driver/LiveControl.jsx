import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { MapPin, AlertCircle } from "lucide-react";

export default function LiveControl({ busId }) {
  const { socket, isConnected } = useSocket();
  const [live, setLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (!busId || !socket) return;
    socket.emit("joinBus", busId);

    return () => {
      socket.emit("leaveBus", busId);
    };
  }, [busId, socket]);

  useEffect(() => {
    let interval;

    if (live && busId && socket && isConnected) {
      // Send location immediately on start
      sendLocation();

      // Then send every 5 seconds
      interval = setInterval(sendLocation, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [live, busId, socket, isConnected]);

  const sendLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        socket.emit("bus:location", {
          busId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLastUpdate(new Date());
        setLocationError(null);
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`);
      }
    );
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Live Location Tracking</h3>

      {locationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{locationError}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${live ? "bg-red-500 animate-pulse" : "bg-slate-300"}`}></div>
          <span className={`text-sm font-medium ${live ? "text-red-600" : "text-slate-600"}`}>
            {live ? "Sharing Live Location" : "Location Tracking Inactive"}
          </span>
        </div>

        {lastUpdate && (
          <div className="text-xs text-slate-600">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        <button
          onClick={() => setLive(!live)}
          className={`w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            live
              ? "bg-red-600 hover:bg-red-700 shadow-md"
              : "bg-green-600 hover:bg-green-700 shadow-md"
          }`}
        >
          <MapPin className="w-5 h-5" />
          {live ? "Stop Sharing Location" : "Start Sharing Location"}
        </button>

        <p className="text-xs text-slate-600 text-center">
          {live
            ? "Your location is being shared with students every 5 seconds"
            : "Toggle to start sharing your live location with students"}
        </p>
      </div>
    </div>
  );
}
