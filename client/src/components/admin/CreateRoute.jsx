import { useState, useCallback } from "react";
import { Plus, Trash2, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { createRoute } from "../../services/adminApi";
import LocationAutocomplete from "../maps/LocationAutocomplete";
import RouteMapPreview from "../maps/RouteMapPreview";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Alert from "../ui/Alert";

export default function CreateRoute({ onCreated }) {
  const [routeName, setRouteName] = useState("");
  const [stops, setStops] = useState([]);
  const [pendingStop, setPendingStop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // called when user selects a place
  const onSelectStop = (place) => {
    setPendingStop(place);
    setError("");
  };

  // confirm adding stop
  const addStop = () => {
    if (!pendingStop) {
      setError("Please select a location first");
      return;
    }
    
    // Check for duplicates
    if (stops.some(s => s.name === pendingStop.name)) {
      setError("This stop already exists in the route");
      return;
    }
    
    setStops([...stops, pendingStop]);
    setPendingStop(null);
  };

  const removeStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const submit = async () => {
    setError("");
    setSuccess(false);
    
    // Validation
    if (!routeName.trim()) {
      setError("Please enter a route name");
      return;
    }
    
    if (stops.length < 2) {
      setError("Please add at least 2 stops to create a route");
      return;
    }

    setLoading(true);
    try {
      const routeData = {
        routeName: routeName.trim(),
        stops: stops.map((stop, index) => ({
          name: stop.name,
          latitude: stop.lat,
          longitude: stop.lng,
          order: index + 1
        }))
      };

      console.log("Submitting route data:", routeData);
      
      const response = await createRoute(routeData);
      console.log("Route created successfully:", response);
      
      setSuccess(true);
      setRouteName("");
      setStops([]);
      setPendingStop(null);
      
      if (onCreated) {
        onCreated();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating route:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to create route";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error" icon={AlertCircle} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={CheckCircle}>
          Route created successfully!
        </Alert>
      )}

      <div className="space-y-4">
        {/* Route name */}
        <Input
          label="Route Name"
          placeholder="e.g., North Route, Route A"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          disabled={loading}
        />

        {/* Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Stops
          </label>
          <LocationAutocomplete onSelect={onSelectStop} disabled={loading} />
        </div>

        {/* Add stop button */}
        <Button
          onClick={addStop}
          disabled={!pendingStop || loading}
          icon={Plus}
          color="primary"
          variant="outline"
          fullWidth
        >
          Add Stop
        </Button>

        {/* Stop list */}
        {stops.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={18} />
              Route Stops ({stops.length})
            </p>
            <ol className="space-y-2">
              {stops.map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-3 bg-white rounded border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-semibold rounded-full">
                      {i + 1}
                    </span>
                    <span className="text-gray-900 font-medium">{s.name}</span>
                  </div>
                  <button
                    onClick={() => removeStop(i)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Remove stop"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Map preview */}
        {stops.length > 1 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <RouteMapPreview stops={stops} />
          </div>
        )}

        {/* Create route */}
        <Button
          onClick={submit}
          disabled={stops.length < 2 || !routeName.trim() || loading}
          isLoading={loading}
          fullWidth
          size="lg"
        >
          {loading ? "Creating Route..." : "Create Route"}
        </Button>

        {stops.length < 2 && (
          <p className="text-sm text-gray-500 text-center">
            Add at least 2 stops to create a route
          </p>
        )}
      </div>
    </div>
  );
}
