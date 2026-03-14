import { useState, useEffect } from "react";
import { Trash2, Bus as BusIcon, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { getAllBuses, deleteBus } from "../../services/adminApi";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Card from "../ui/Card";

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Load buses on mount
  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const data = await getAllBuses();
      setBuses(data.buses || []);
      setError("");
    } catch (err) {
      console.error("Error fetching buses:", err);
      setError(err.response?.data?.message || "Failed to load buses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (busId) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) {
      return;
    }

    try {
      setDeletingId(busId);
      await deleteBus(busId);
      
      // Remove from list
      setBuses(buses.filter(b => b._id !== busId));
      setSuccess("Bus deleted successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting bus:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete bus";
      setError(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error" icon={AlertCircle} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={CheckCircle} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Existing Buses</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage buses assigned to routes.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
          {buses.length} bus{buses.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {buses.length === 0 ? (
        <Card className="p-8 text-center">
          <BusIcon className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="text-gray-600">No buses created yet. Create one using the form above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {buses.map((bus) => (
            <Card key={bus._id} className="p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <BusIcon className="text-blue-500 flex-shrink-0" size={20} />
                    <h4 className="font-semibold text-gray-900">
                      {bus.busNumber}
                    </h4>
                  </div>
                  
                  {/* Bus details */}
                  <div className="ml-7 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Capacity</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {bus.capacity} seats
                        </p>
                      </div>
                      {bus.routeId && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Route</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {bus.routeId.routeName}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Route stops if available */}
                    {bus.routeId && bus.routeId.stops && bus.routeId.stops.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Route Stops</p>
                        <div className="flex flex-wrap gap-2">
                          {bus.routeId.stops.map((stop, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
                            >
                              <span className="font-semibold mr-1">#{stop.order}</span>
                              {stop.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  onClick={() => handleDelete(bus._id)}
                  disabled={deletingId === bus._id}
                  icon={Trash2}
                  color="danger"
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                >
                  {deletingId === bus._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
