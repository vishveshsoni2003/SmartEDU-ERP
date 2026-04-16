import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import L from "leaflet";
import api from "../../services/api";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";

// Fix generic Leaflet marker URLs structurally
const busIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const stopIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// React Leaflet v4 immutable center bug fix allowing live map-panning securely hooked to Socket updates
function LiveCoordinateHook({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
}

export default function LiveBusMap({ busId, isDriver = false }) {
  const { socket, isConnected } = useSocket();
  const [position, setPosition] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!busId) {
      setLoading(false);
      return;
    }

    api.get(`/buses/${busId}`).then((res) => {
      if (res.data.bus?.routeId) {
        setRoute(res.data.bus.routeId);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed mapped route metadata resolving", err);
      setLoading(false);
    });
  }, [busId]);

  useEffect(() => {
    if (!busId || !socket) return;

    // Authenticate channel
    socket.emit("joinBus", busId);

    // Continuous event parsing securely overwriting states
    socket.on("bus:location:update", (location) => {
      setPosition([location.lat, location.lng]);
    });

    return () => {
      socket.off("bus:location:update");
      socket.emit("leaveBus", busId);
    };
  }, [busId, socket]);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-slate-50 border rounded-xl animate-pulse">
        <LocateFixed className="h-8 w-8 text-slate-300 animate-spin mb-2" />
        <p className="text-slate-500 font-medium tracking-wide text-sm">Syncing GPS Nodes...</p>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-dashed rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <LocateFixed className="h-10 w-10 text-slate-300 mb-2 relative z-10" />
        <p className="text-slate-500 font-medium text-sm relative z-10">
          {isDriver ? "Initiate telemetry broadcasing" : "Awaiting bus vehicle socket signal stream"}
        </p>
      </div>
    );
  }

  // Draw explicit arrays
  const routePolyline = route?.stops
    ? route.stops.sort((a, b) => a.order - b.order).map((stop) => [stop.lat, stop.lng])
    : [];

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer center={position} zoom={15} className="w-full h-[400px] lg:h-full z-0 font-sans">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <LiveCoordinateHook position={position} />

        {routePolyline.length > 1 && (
          <Polyline positions={routePolyline} color="#3b82f6" weight={4} opacity={0.8} />
        )}

        <Marker position={position} icon={busIcon}>
          <Popup className="font-sans">
            <div className="font-bold text-slate-800 text-[13px] tracking-wide uppercase border-b pb-1 mb-1">
              {isDriver ? "Driver Core" : "Vehicle Target"}
            </div>
            <p className="text-slate-600 text-[11px] font-mono">
              {position[0].toFixed(5)}, {position[1].toFixed(5)}
            </p>
          </Popup>
        </Marker>

        {route?.stops &&
          route.stops.map((stop, idx) => (
            <Marker key={idx} position={[stop.lat, stop.lng]} icon={stopIcon}>
              <Popup>
                <div className="font-bold text-slate-800 text-[12px] border-b pb-1 mb-1">Stop {stop.order}</div>
                <p className="text-slate-600 font-medium text-[11px] uppercase">{stop.name}</p>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
