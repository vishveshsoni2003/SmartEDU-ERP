import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import { getAllHostels, deleteHostel } from "../../services/adminApi";

export default function HostelList({ refreshTrigger }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHostels = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getAllHostels();
      setHostels(data.hostels || []);
    } catch {
      toast.error("Failed to load hostels");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels, refreshTrigger]);

  const handleDelete = (hostelId, hostelName) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-slate-900 tracking-tight">Demolish "{hostelName}"?</p>
        <p className="text-sm text-slate-500 font-medium">This action irrevocably removes all associated structural mappings.</p>
        <div className="flex gap-2 justify-end mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            setDeleting(hostelId);
            try {
              await deleteHostel(hostelId);
              setHostels((prev) => prev.filter((h) => h._id !== hostelId));
              toast.success("Hostel structure successfully removed!");
            } catch (error) {
              toast.error(error.response?.data?.message || "Failed to remove structural mapping");
            } finally {
              setDeleting(null);
            }
          }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-600/20 transition-all">Confirm Demolition</button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  if (loading) return <p className="text-slate-500 dark:text-slate-400 py-4">Loading hostels...</p>;
  if (!hostels.length)
    return <p className="text-slate-500 dark:text-slate-400 py-4">No hostels found</p>;

  return (
    <div className="space-y-4">
      {/* Refresh bar */}
      <div className="flex justify-end">
        <button
          onClick={() => fetchHostels(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Occupancy
        </button>
      </div>

      {hostels.map((h) => (
        <div
          key={h._id}
          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:border-blue-300 dark:hover:border-blue-500/50"
        >
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
              {h.name} <span className="text-xs ml-2 font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">{h.type}</span>
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Total Structural Units: {h.totalRooms}
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
              Allocated: {h.occupiedRooms || 0} / {h.totalRooms} rooms
            </span>
            <button
              onClick={() => handleDelete(h._id, h.name)}
              disabled={deleting === h._id}
              className="px-4 py-2 font-bold text-sm bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {deleting === h._id ? "Removing..." : "Demolish"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
