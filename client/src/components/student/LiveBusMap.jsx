import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect, useState, Component } from "react";
import { useSocket } from "../../context/SocketContext";
import L from "leaflet";
import api from "../../services/api";
import "leaflet/dist/leaflet.css";
import { MapPin, AlertCircle, Bus, Navigation, Clock, Circle, Users } from "lucide-react";

/* ─────────────────────────────────────────────────────
   Fix Leaflet default icon 404 in Vite/webpack builds
───────────────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─────────────────────────────────────────────────────
   Custom bus marker — shows bus number + bus emoji
   Works in both light and dark mode via CSS injection
───────────────────────────────────────────────────── */
function createBusMarker(busNumber, isLive = false) {
  const label = busNumber ? `🚌 ${busNumber}` : "🚌";
  return L.divIcon({
    className: "",          // override Leaflet's default white box
    iconAnchor: [36, 44],   // centre bottom
    popupAnchor: [0, -44],
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
      ">
        <div style="
          background: ${isLive ? "#16a34a" : "#2563eb"};
          color: white;
          font-weight: 800;
          font-size: 11px;
          font-family: system-ui, sans-serif;
          padding: 5px 10px;
          border-radius: 20px;
          white-space: nowrap;
          letter-spacing: 0.03em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          border: 2px solid rgba(255,255,255,0.4);
        ">
          ${label}
        </div>
        <div style="
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${isLive ? "#16a34a" : "#2563eb"};
          margin-top: -1px;
        "></div>
      </div>
    `,
  });
}

/* ─────────────────────────────────────────────────────
   Custom stop marker — numbered circle
───────────────────────────────────────────────────── */
function createStopMarker(order, isTerminal = false) {
  const bg    = isTerminal ? "#2563eb" : "#64748b";
  const size  = isTerminal ? 28 : 22;
  const font  = isTerminal ? 11 : 10;
  return L.divIcon({
    className: "",
    iconAnchor:  [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: ${bg};
        border: 2.5px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white;
        font-weight: 800;
        font-size: ${font}px;
        font-family: system-ui, sans-serif;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">${order}</div>
    `,
  });
}

/* ─────────────────────────────────────────────────────
   Auto-pan hook — smooth follow without re-mount
───────────────────────────────────────────────────── */
function PanToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true, duration: 0.6 });
  }, [position, map]);
  return null;
}

/* ─────────────────────────────────────────────────────
   React error boundary — catches Leaflet internals
───────────────────────────────────────────────────── */
class MapErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div
        className="w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-rose-200 dark:border-rose-500/30 rounded-xl"
        style={{ height: this.props.height || 400 }}
      >
        <AlertCircle className="h-10 w-10 text-rose-400 mb-2" />
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Map failed to render.</p>
        <button
          onClick={() => this.setState({ hasError: false })}
          className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          Retry
        </button>
      </div>
    );
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────────────
   Trip status pill (shown in info panel)
───────────────────────────────────────────────────── */
const STATUS_CLS = {
  ACTIVE: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  PAUSED: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
  IDLE:   "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
  ENDED:  "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
};

/* ─────────────────────────────────────────────────────
   Main export
   Props:
     busId     — MongoDB _id of the bus (string)
     isDriver  — true when rendered on driver dashboard
     height    — pixel height of the map area (default 400)
───────────────────────────────────────────────────── */
export default function LiveBusMap({ busId, isDriver = false, height = 400 }) {
  const { socket } = useSocket();

  const [position,    setPosition]    = useState(null);
  const [busData,     setBusData]     = useState(null);   // full bus object
  const [lastUpdate,  setLastUpdate]  = useState(null);
  const [loading,     setLoading]     = useState(true);

  /* ── Normalise busId — handle object or string ── */
  const resolvedBusId = busId?._id || busId || null;

  /* ── Load bus + route data ── */
  useEffect(() => {
    if (!resolvedBusId) { setLoading(false); return; }

    api.get(`/transport/buses/${resolvedBusId}`)
      .then(res => {
        const b = res.data.bus;
        setBusData(b);
        const loc = b?.currentLocation;
        if (loc?.lat && loc?.lng) {
          setPosition([loc.lat, loc.lng]);
          setLastUpdate(new Date(loc.updatedAt || Date.now()));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resolvedBusId]);

  /* ── Socket: live location + trip state events ── */
  useEffect(() => {
    if (!resolvedBusId || !socket) return;

    socket.emit("joinBus", resolvedBusId);

    const onLocation = (data) => {
      if (data?.lat != null && data?.lng != null) {
        setPosition([data.lat, data.lng]);
        setLastUpdate(new Date(data.updatedAt || Date.now()));
      }
    };
    const onTripStart  = () => setBusData(b => b ? { ...b, tripStatus: "ACTIVE" } : b);
    const onTripPause  = () => setBusData(b => b ? { ...b, tripStatus: "PAUSED" } : b);
    const onTripResume = () => setBusData(b => b ? { ...b, tripStatus: "ACTIVE" } : b);
    const onTripEnd    = () => setBusData(b => b ? { ...b, tripStatus: "IDLE"   } : b);

    socket.on("bus:location:update", onLocation);
    socket.on("trip:start",  onTripStart);
    socket.on("trip:pause",  onTripPause);
    socket.on("trip:resume", onTripResume);
    socket.on("trip:end",    onTripEnd);

    return () => {
      socket.off("bus:location:update", onLocation);
      socket.off("trip:start",  onTripStart);
      socket.off("trip:pause",  onTripPause);
      socket.off("trip:resume", onTripResume);
      socket.off("trip:end",    onTripEnd);
      socket.emit("leaveBus", resolvedBusId);
    };
  }, [resolvedBusId, socket]);

  /* ── Loading ── */
  if (loading) return (
    <div
      className="w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl"
      style={{ height }}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3" />
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading map…</p>
    </div>
  );

  /* ── No position yet ── */
  if (!position) return (
    <div
      className="w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl gap-3"
      style={{ height }}
    >
      <MapPin className="h-12 w-12 text-slate-300 dark:text-slate-600" />
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">
          {isDriver ? "No location broadcasting yet" : "Bus location not available"}
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
          {isDriver
            ? "Press Start Trip to begin sharing your location."
            : "The bus driver has not started the trip yet."}
        </p>
      </div>
      {/* Show bus info even without location */}
      {busData && (
        <div className="flex items-center gap-2 mt-1 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Bus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Bus {busData.busNumber}
          {busData.routeId?.routeName && (
            <span className="text-slate-400">· {busData.routeId.routeName}</span>
          )}
        </div>
      )}
    </div>
  );

  /* ── Derived data ── */
  const route       = busData?.routeId;
  const busNumber   = busData?.busNumber ?? "";
  const driverName  = busData?.driverId?.name ?? null;
  const tripStatus  = busData?.tripStatus ?? "IDLE";
  const isLive      = tripStatus === "ACTIVE";

  const stops = route?.stops
    ?.filter(s => s.lat != null && s.lng != null)
    .sort((a, b) => a.order - b.order) ?? [];

  const polyline = stops.map(s => [s.lat, s.lng]);

  return (
    <div className="space-y-3">
      {/* ── Info strip above the map ── */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Trip status */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold ${STATUS_CLS[tripStatus] || STATUS_CLS.IDLE}`}>
          {isLive && <Circle className="h-2 w-2 fill-current animate-pulse" />}
          {tripStatus}
        </span>

        {/* Bus */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold">
          <Bus className="h-3.5 w-3.5" />
          Bus {busNumber}
        </span>

        {/* Route */}
        {route?.routeName && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
            <Navigation className="h-3.5 w-3.5" />
            {route.routeName}
          </span>
        )}

        {/* Driver */}
        {driverName && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
            <Users className="h-3.5 w-3.5" />
            {driverName}
          </span>
        )}

        {/* Stops count */}
        {stops.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
            <MapPin className="h-3.5 w-3.5" />
            {stops.length} stops
          </span>
        )}

        {/* Last updated */}
        {lastUpdate && (
          <span className="ml-auto inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
            <Clock className="h-3.5 w-3.5" />
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* ── Map container ── */}
      <MapErrorBoundary height={height}>
        <div
          className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
          style={{ height }}
        >
          <MapContainer
            center={position}
            zoom={14}
            style={{ width: "100%", height: "100%" }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Auto-pan on new position */}
            <PanToPosition position={position} />

            {/* Route polyline */}
            {polyline.length >= 2 && (
              <Polyline
                positions={polyline}
                color="#3b82f6"
                weight={4}
                opacity={0.75}
                dashArray={isLive ? undefined : "8, 8"}
              />
            )}

            {/* ── Bus marker (custom divIcon with bus number) ── */}
            <Marker
              position={position}
              icon={createBusMarker(busNumber, isLive)}
              zIndexOffset={1000}
            >
              <Popup maxWidth={220}>
                <div className="text-sm font-sans">
                  <p className="font-black text-slate-900 text-base mb-1">🚌 Bus {busNumber}</p>
                  {route?.routeName && (
                    <p className="text-slate-600 text-xs mb-1">
                      <span className="font-semibold">Route:</span> {route.routeName}
                    </p>
                  )}
                  {driverName && (
                    <p className="text-slate-600 text-xs mb-1">
                      <span className="font-semibold">Driver:</span> {driverName}
                    </p>
                  )}
                  <p className="text-slate-500 text-xs font-mono">
                    {position[0].toFixed(5)}, {position[1].toFixed(5)}
                  </p>
                  {lastUpdate && (
                    <p className="text-slate-400 text-xs mt-1">
                      Updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* ── Stop markers (numbered custom divIcons) ── */}
            {stops.map((stop, idx) => (
              <Marker
                key={`stop-${idx}`}
                position={[stop.lat, stop.lng]}
                icon={createStopMarker(stop.order, idx === 0 || idx === stops.length - 1)}
              >
                <Popup maxWidth={180}>
                  <div className="text-xs font-sans">
                    <p className="font-bold text-slate-800 mb-0.5">
                      Stop {stop.order}
                      {(idx === 0) && " · Start"}
                      {(idx === stops.length - 1) && " · End"}
                    </p>
                    <p className="text-slate-600 font-medium">{stop.name}</p>
                    {stop.lat && stop.lng && (
                      <p className="text-slate-400 font-mono text-[10px] mt-1">
                        {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </MapErrorBoundary>
    </div>
  );
}
