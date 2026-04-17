import { useEffect, useState, useCallback } from "react";
import { Trash2, Edit, Calendar, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const TYPE_COLORS = {
  HOLIDAY: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
  VACATION: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
};

export default function HolidayList({ refreshKey = 0, onEdit }) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/holidays");
      setHolidays(res.data.holidays || []);
    } catch {
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays, refreshKey]);

  const handleDelete = (h) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-bold text-slate-900 dark:text-white">Delete "{h.title}"?</p>
          <p className="text-sm text-slate-500">{new Date(h.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setDeleting(h._id);
                try {
                  await api.delete(`/holidays/${h._id}`);
                  setHolidays((prev) => prev.filter((x) => x._id !== h._id));
                  toast.success("Holiday removed");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Failed to delete holiday");
                } finally {
                  setDeleting(null);
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-600/20 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (holidays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarDays className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
        <p className="text-lg font-bold text-slate-500 dark:text-slate-400">No holidays added yet</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add holidays using the form above.</p>
      </div>
    );
  }

  // Group by month
  const grouped = holidays.reduce((acc, h) => {
    const month = new Date(h.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(h);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([month, items]) => (
        <div key={month}>
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {month}
          </h4>
          <div className="space-y-2">
            {items.map((h) => {
              const d = new Date(h.date);
              return (
                <div
                  key={h._id}
                  className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-800 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Date block */}
                    <div className="shrink-0 w-12 text-center">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {d.toLocaleDateString("en-US", { month: "short" })}
                      </p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                        {d.getDate()}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 shrink-0" />

                    {/* Info */}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{h.title}</p>
                      {h.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{h.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${TYPE_COLORS[h.type] || TYPE_COLORS.HOLIDAY}`}>
                      {h.type === "VACATION" ? "Vacation" : "Holiday"}
                    </span>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(h)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit holiday"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(h)}
                      disabled={deleting === h._id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all"
                      title="Delete holiday"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
