import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, MapPin, AlertCircle } from "lucide-react";
import { createRoute } from "../../services/adminApi";

// Google Maps components are loaded conditionally — only if the API key is configured.
// This prevents the "google is not defined" crash when the key is missing.
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Lazy Google Maps imports wrapped in a conditional so Vite tree-shakes them
// when not needed. Import at module level is fine — LoadScript won't call
// window.google until it has successfully loaded the script.
import { LoadScript } from "@react-google-maps/api";
import LocationAutocomplete from "../maps/LocationAutocomplete";
import RouteMapPreview from "../maps/RouteMapPreview";

const LIBRARIES = ["places"];

/**
 * Inner form — rendered once Google Maps is ready (or in fallback mode).
 */
function RouteForm({ onCreated, googleReady }) {
  const [routeName, setRouteName] = useState("");
  const [stops, setStops]         = useState([]);
  const [pendingStop, setPendingStop] = useState(null);
  const [loading, setLoading]     = useState(false);

  const addStop = () => {
    if (!pendingStop) return toast.error("Please select a location first");
    if (stops.some(s => s.name === pendingStop.name)) {
      return toast.error("This stop is already in the route");
    }
    setStops(prev => [...prev, pendingStop]);
    setPendingStop(null);
  };

  const removeStop = (index) => setStops(prev => prev.filter((_, i) => i !== index));

  const submit = async () => {
    if (!routeName.trim()) return toast.error("Enter a route name");
    if (stops.length < 2)  return toast.error("Add at least 2 stops");

    setLoading(true);
    try {
      await createRoute({
        routeName: routeName.trim(),
        stops: stops.map((stop, index) => ({
          name:      stop.name,
          lat:       stop.lat,
          lng:       stop.lng,
          order:     index + 1
        }))
      });
      toast.success("Route created successfully");
      setRouteName("");
      setStops([]);
      setPendingStop(null);
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create route");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors";

  return (
    <div className="space-y-4">
      {/* Route name */}
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Route Name</label>
        <input
          value={routeName}
          onChange={e => setRouteName(e.target.value)}
          placeholder="e.g. North Route, Route A"
          disabled={loading}
          className={inputCls}
        />
      </div>

      {/* Location search — only available when Google Maps is ready */}
      {googleReady ? (
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Add Stop</label>
          <LocationAutocomplete onSelect={setPendingStop} disabled={loading} />
        </div>
      ) : (
        /* Fallback: manual lat/lng entry when Google Maps key is not set */
        <ManualStopEntry onSelect={setPendingStop} disabled={loading} />
      )}

      {/* Add stop button */}
      <button
        onClick={addStop}
        disabled={!pendingStop || loading}
        className="flex items-center gap-2 justify-center w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 text-sm"
      >
        <Plus className="h-4 w-4" /> Add Stop
      </button>

      {/* Stops list */}
      {stops.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
          <p className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Stops ({stops.length})
          </p>
          <ol className="space-y-2">
            {stops.map((s, i) => (
              <li key={i} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-black rounded-full">
                    {i + 1}
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold text-sm">{s.name}</span>
                </div>
                <button
                  onClick={() => removeStop(i)}
                  className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 p-1.5 rounded-lg transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Map preview — only available with Google Maps */}
      {googleReady && stops.length > 1 && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <RouteMapPreview stops={stops} />
        </div>
      )}

      {/* Submit */}
      <button
        onClick={submit}
        disabled={stops.length < 2 || !routeName.trim() || loading}
        className="flex justify-center items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
      >
        {loading
          ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
          : "Create Route"
        }
      </button>

      {stops.length < 2 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          Add at least 2 stops to create a route.
        </p>
      )}
    </div>
  );
}

/**
 * ManualStopEntry — fallback when Google Maps API key is not configured.
 * Lets admin type stop name + coordinates directly.
 */
function ManualStopEntry({ onSelect, disabled }) {
  const [name, setName]   = useState("");
  const [lat, setLat]     = useState("");
  const [lng, setLng]     = useState("");

  const inputCls = "px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors";

  const handleSelect = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!name.trim() || isNaN(latNum) || isNaN(lngNum)) {
      toast.error("Enter stop name, latitude, and longitude");
      return;
    }
    onSelect({ name: name.trim(), lat: latNum, lng: lngNum });
    setName(""); setLat(""); setLng("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
          Google Maps API key not configured. Enter coordinates manually or set <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded">VITE_GOOGLE_MAPS_KEY</code>.
        </p>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Stop Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Gate" disabled={disabled} className={`w-full ${inputCls}`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Latitude</label>
          <input value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. 28.6139" disabled={disabled} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Longitude</label>
          <input value={lng} onChange={e => setLng(e.target.value)} placeholder="e.g. 77.2090" disabled={disabled} className={inputCls} />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSelect}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
      >
        <MapPin className="h-4 w-4" /> Set as Pending Stop
      </button>
    </div>
  );
}

/**
 * CreateRoute — top-level export.
 * Loads Google Maps only if the API key is set; otherwise uses manual entry.
 */
export default function CreateRoute({ onCreated }) {
  if (!GOOGLE_KEY) {
    // No API key — render form with manual coordinate entry, no LoadScript
    return <RouteForm onCreated={onCreated} googleReady={false} />;
  }

  return (
    <LoadScript googleMapsApiKey={GOOGLE_KEY} libraries={LIBRARIES}>
      <RouteForm onCreated={onCreated} googleReady={true} />
    </LoadScript>
  );
}
