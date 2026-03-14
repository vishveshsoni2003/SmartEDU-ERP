import { useState, useEffect } from "react";
import { Trash2, MapPin, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { getAllRoutes, deleteRoute } from "../../services/adminApi";
import QuickAssignBus from "./QuickAssignBus";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Card from "../ui/Card";

export default function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Load routes on mount
  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const data = await getAllRoutes();
      setRoutes(data.routes || []);
      setError("");
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError(err.response?.data?.message || "Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm("Are you sure you want to delete this route? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(routeId);
      await deleteRoute(routeId);
      
      // Remove from list
      setRoutes(routes.filter(r => r._id !== routeId));
      setSuccess("Route deleted successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting route:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete route";
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
          <h3 className="text-lg font-semibold text-gray-900">Existing Routes</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage and delete bus routes. Routes assigned to buses cannot be deleted.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
          {routes.length} route{routes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {routes.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="text-gray-600">No routes created yet. Create one using the form above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {routes.map((route) => (
            <Card key={route._id} className="p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="text-blue-500 flex-shrink-0" size={18} />
                    <h4 className="font-semibold text-gray-900 truncate">
                      {route.routeName}
                    </h4>
                  </div>
                  
                  {/* Stops list */}
                  <div className="ml-7 space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      {route.stops.length} stops
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {route.stops.map((stop, idx) => (
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

                  {/* Assign bus form */}
                  <div className="mt-3">
                    <QuickAssignBus 
                      routeId={route._id}
                      routeName={route.routeName}
                      onBusCreated={fetchRoutes}
                    />
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  onClick={() => handleDelete(route._id)}
                  disabled={deletingId === route._id}
                  icon={Trash2}
                  color="danger"
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                >
                  {deletingId === route._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
