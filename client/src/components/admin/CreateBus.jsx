import { useEffect, useState } from "react";
import { Bus, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { createBus, getAllRoutes } from "../../services/adminApi";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Alert from "../ui/Alert";
import Card from "../ui/Card";

export default function CreateBus({ onCreated }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [form, setForm] = useState({
    busNumber: "",
    capacity: "",
    routeId: ""
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setRoutesLoading(true);
      const data = await getAllRoutes();
      setRoutes(data.routes || []);
      setError("");
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError(err.response?.data?.message || "Failed to load routes");
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError(""); // Clear error when user starts typing
  };

  const validate = () => {
    if (!form.busNumber.trim()) {
      setError("Please enter a bus number");
      return false;
    }
    if (!form.capacity || parseInt(form.capacity) < 1) {
      setError("Please enter a valid capacity (minimum 1)");
      return false;
    }
    if (!form.routeId) {
      setError("Please select a route");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const busData = {
        busNumber: form.busNumber.trim(),
        capacity: parseInt(form.capacity),
        routeId: form.routeId
      };

      console.log("Creating bus:", busData);
      const response = await createBus(busData);
      console.log("Bus created successfully:", response);

      setSuccess(true);
      setForm({ busNumber: "", capacity: "", routeId: "" });

      if (onCreated) {
        onCreated();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating bus:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to create bus";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedRoute = routes.find(r => r._id === form.routeId);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error" icon={AlertCircle} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={CheckCircle}>
          Bus created successfully!
        </Alert>
      )}

      <div className="space-y-4">
        {/* Bus number */}
        <Input
          label="Bus Number"
          placeholder="e.g., BUS-001, Route A Bus 1"
          name="busNumber"
          value={form.busNumber}
          onChange={handleChange}
          disabled={loading}
        />

        {/* Capacity */}
        <Input
          label="Capacity (Number of Seats)"
          placeholder="e.g., 50"
          type="number"
          name="capacity"
          value={form.capacity}
          onChange={handleChange}
          disabled={loading}
          min="1"
        />

        {/* Route selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Route *
          </label>
          {routesLoading ? (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Loader className="animate-spin text-blue-500 mr-2" size={18} />
              <span className="text-gray-600">Loading routes...</span>
            </div>
          ) : routes.length === 0 ? (
            <Card className="p-4 bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                No routes available. Please create a route first.
              </p>
            </Card>
          ) : (
            <select
              name="routeId"
              value={form.routeId}
              onChange={handleChange}
              disabled={loading || routes.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">-- Select a route --</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.routeName} ({route.stops.length} stops)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Route preview */}
        {selectedRoute && (
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-sm font-medium text-gray-900 mb-2">Selected Route:</p>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Route:</span> {selectedRoute.routeName}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Stops:</span> {selectedRoute.stops.length}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedRoute.stops.map((stop, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-white border border-blue-200 text-gray-700"
                  >
                    {stop.order}. {stop.name}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Create button */}
        <Button
          onClick={submit}
          disabled={!form.busNumber.trim() || !form.capacity || !form.routeId || loading || routes.length === 0}
          isLoading={loading}
          fullWidth
          size="lg"
          icon={Bus}
        >
          {loading ? "Creating Bus..." : "Create Bus"}
        </Button>
      </div>
    </div>
  );
}
