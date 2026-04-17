import { useEffect, useState } from "react";
import { Megaphone, Calendar, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function FacultyNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      // Fetch notices created by this faculty member
      const res = await api.get("/notices?mine=true");
      setNotices(res.data.notices || []);
    } catch {
      toast.error("Failed to load your published notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-slate-900 dark:text-white">Delete this notice?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/notices/${id}`);
              setNotices(prev => prev.filter(n => n._id !== id));
              toast.success("Notice deleted");
            } catch { toast.error("Failed to delete notice"); }
          }} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold">Delete</button>
        </div>
      </div>
    ), { duration: Infinity, position: "top-center" });
  };

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
    </div>
  );

  if (notices.length === 0) return (
    <div className="text-center py-10">
      <Megaphone className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No notices published yet.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {notices.map(n => (
        <div key={n._id} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{n.title}</h4>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  n.targetAudience === "ALL"     ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400" :
                  n.targetAudience === "STUDENT" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" :
                                                   "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                }`}>{n.targetAudience}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(n.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button onClick={() => handleDelete(n._id)} className="shrink-0 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
