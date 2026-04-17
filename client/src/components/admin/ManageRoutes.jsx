import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Trash2, MapPin, Loader } from "lucide-react";
import { getAllRoutes, deleteRoute } from "../../services/adminApi";
import QuickAssignBus from "./QuickAssignBus";

export default function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (routeId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-slate-900 tracking-tight">Decouple and delete this mapped route?</p>
        <p className="text-sm text-slate-500 font-medium">This cannot be undone. Active vehicles must be re-routed first.</p>
        <div className="flex gap-2 justify-end mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              setDeletingId(routeId);
              await deleteRoute(routeId);
              setRoutes((prev) => prev.filter(r => r._id !== routeId));
              toast.success("Topological Route definitively erased!");
            } catch (err) {
              toast.error(err.response?.data?.message || "Failed to erase route");
            } finally {
              setDeletingId(null);
            }
          }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-600/20 transition-all">Erase Route</button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Map Vectors</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage deployed transit routes. Active maps affixed to vehicles cannot be dropped.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 text-sm font-black tracking-widest uppercase">
          {routes.length} route{routes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {routes.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <MapPin className="mx-auto text-slate-400 mb-3" size={32} />
          <p className="text-slate-600 dark:text-slate-400 font-bold">No active map vectors identified.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {routes.map((route) => (
            <div key={route._id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-blue-300 dark:hover:border-blue-800 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-xl">
                      <MapPin className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={18} />
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight truncate">
                      {route.routeName}
                    </h4>
                  </div>

                  {/* Stops list */}
                  <div className="ml-11 space-y-2">
                    <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
                      {route.stops.length} stops
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {route.stops.map((stop, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                        >
                          <span className="font-black mr-1.5 text-blue-600 dark:text-blue-400">P{stop.order}</span>
                          {stop.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Assign bus form */}
                  <div className="mt-6 ml-11 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <QuickAssignBus
                      routeId={route._id}
                      routeName={route.routeName}
                      onBusCreated={fetchRoutes}
                    />
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(route._id)}
                  disabled={deletingId === route._id}
                  className="flex-shrink-0 self-start p-2.5 rounded-xl text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all font-bold text-sm disabled:opacity-50"
                  title="Erase Route"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
