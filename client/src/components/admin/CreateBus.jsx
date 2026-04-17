import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bus, Loader } from "lucide-react";
import { createBus, getAllRoutes } from "../../services/adminApi";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function CreateBus({ onCreated, refreshKey = 0 }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [form, setForm] = useState({
    busNumber: "",
    capacity: "",
    routeId: ""
  });

  useEffect(() => {
    fetchRoutes();
  }, [refreshKey]);

  const fetchRoutes = async () => {
    try {
      setRoutesLoading(true);
      const data = await getAllRoutes();
      setRoutes(data.routes || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load routes");
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    if (!form.busNumber.trim()) {
      toast.error("Please enter a valid bus registry number");
      return false;
    }
    if (!form.capacity || parseInt(form.capacity) < 1) {
      toast.error("Bus physical capacity cannot be sub-zero");
      return false;
    }
    if (!form.routeId) {
      toast.error("Please allocate an active route vector");
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
      await createBus(busData);
      toast.success("Transit vehicle successfully provisioned!");

      setForm({ busNumber: "", capacity: "", routeId: "" });

      if (onCreated) {
        onCreated();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to provision asset");
    } finally {
      setLoading(false);
    }
  };

  const selectedRoute = routes.find(r => r._id === form.routeId);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Bus number */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">Registry Plate</label>
          <input name="busNumber" value={form.busNumber} onChange={handleChange} placeholder="e.g., BUS-001, Route A Bus 1" disabled={loading} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors" />
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">Seat Availability</label>
          <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="e.g., 50" min="1" disabled={loading} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors" />
        </div>

        {/* Route selection */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">
            Assigned Vector *
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
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
            >
              <option value="">-- Assign a route vector --</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.routeName} ({route.stops.length} physical stops)
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
