import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Trash2, Bus as BusIcon, Loader } from "lucide-react";
import { getAllBuses, deleteBus } from "../../services/adminApi";

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load bus manifest");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (busId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-slate-900 tracking-tight">Retire and erase this transit vehicle?</p>
        <p className="text-sm text-slate-500 font-medium">This cannot be undone and will impact student routes.</p>
        <div className="flex gap-2 justify-end mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              setDeletingId(busId);
              await deleteBus(busId);
              setBuses((prev) => prev.filter(b => b._id !== busId));
              toast.success("Transit vehicle decommissioned!");
            } catch (err) {
              toast.error(err.response?.data?.message || "Failed to erase vehicle");
            } finally {
              setDeletingId(null);
            }
          }} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-amber-600/20 transition-all">Decommission</button>
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Transit Vehicles</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage provisioned transit vehicles to map against structural nodes.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 text-sm font-black tracking-widest uppercase">
          {buses.length} component{buses.length !== 1 ? 's' : ''}
        </span>
      </div>

      {buses.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <BusIcon className="mx-auto text-slate-400 mb-3" size={32} />
          <p className="text-slate-600 dark:text-slate-400 font-bold">No operational transit modules discovered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {buses.map((bus) => (
            <div key={bus._id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-amber-300 dark:hover:border-amber-800 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-amber-100 dark:bg-amber-500/20 p-2 rounded-xl">
                      <BusIcon className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                      {bus.busNumber}
                    </h4>
                  </div>

                  {/* Bus details */}
                  <div className="ml-11 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Max Cap</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {bus.capacity} seats
                        </p>
                      </div>
                      {bus.routeId && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Assigned Route</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {bus.routeId.routeName}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Route stops if available */}
                    {bus.routeId && bus.routeId.stops && bus.routeId.stops.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Linear Trajectory</p>
                        <div className="flex flex-wrap gap-2">
                          {bus.routeId.stops.map((stop, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                            >
                              <span className="font-black mr-1.5 text-amber-600 dark:text-amber-400">T{stop.order}</span>
                              {stop.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(bus._id)}
                  disabled={deletingId === bus._id}
                  className="flex-shrink-0 self-start p-2.5 rounded-xl text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all font-bold text-sm disabled:opacity-50"
                  title="Decommission Asset"
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
