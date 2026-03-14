import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import L from "leaflet";
import api from "../../services/api";
import "leaflet/dist/leaflet.css";

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom route stop icon
const stopIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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

    // Fetch bus details to get route
    api.get(`/buses/${busId}`).then((res) => {
      if (res.data.bus?.routeId) {
        setRoute(res.data.bus.routeId);
      }
      setLoading(false);
    });
  }, [busId]);

  useEffect(() => {
    if (!busId || !socket) return;

    socket.emit("joinBus", busId);

    socket.on("bus:location:update", (location) => {
      setPosition([location.lat, location.lng]);
    });

    return () => {
      socket.off("bus:location:update");
      socket.emit("leaveBus", busId);
    };
  }, [busId, socket]);

  if (loading) {
    return <p className="text-slate-500 text-center py-8">Loading map...</p>;
  }

  if (!position) {
    return (
      <p className="text-slate-500 text-center py-8">
        {isDriver
          ? "Start sharing your location to see the map"
          : "Waiting for bus location..."}
      </p>
    );
  }

  // Calculate route polyline if available
  const routePolyline = route?.stops
    ? route.stops.sort((a, b) => a.order - b.order).map((stop) => [stop.lat, stop.lng])
    : [];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer center={position} zoom={15} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Draw route line */}
        {routePolyline.length > 1 && (
          <Polyline positions={routePolyline} color="blue" weight={3} opacity={0.6} />
        )}

        {/* Bus current location */}
        <Marker position={position} icon={busIcon}>
          <Popup>
            <div className="font-semibold">
              {isDriver ? "Your Location" : "Bus Location"}
            </div>
            <p className="text-sm mt-1">
              Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
            </p>
          </Popup>
        </Marker>

        {/* Route stops */}
        {route?.stops &&
          route.stops.map((stop, idx) => (
            <Marker
              key={idx}
              position={[stop.lat, stop.lng]}
              icon={stopIcon}
            >
              <Popup>
                <div className="font-semibold">Stop {stop.order}</div>
                <p className="text-sm">{stop.name}</p>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
