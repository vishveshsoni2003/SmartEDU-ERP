import { useEffect, useState, useCallback } from "react";
import { Megaphone, Trash2, Calendar, Link as LinkIcon, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import Pagination from "../ui/Pagination";
import Skeleton from "../ui/Skeleton";

export default function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notices?page=${page}&limit=${limit}`);
      setNotices(res.data.notices || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      toast.error("Failed to sync Notice Board logs");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-slate-900 tracking-tight">Archive this notice?</p>
        <p className="text-sm text-slate-500 font-medium">This will permanently remove it from active broadcast records.</p>
        <div className="flex gap-2 justify-end mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/notices/${id}`);
              toast.success("Notice successfully archived");
              fetchNotices();
            } catch (err) {
              toast.error("Deletion failed");
            }
          }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-600/20 transition-all">Archive Now</button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 animate-pulse">
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))
        ) : notices.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Megaphone className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No notices found.</p>
          </div>
        ) : (
          notices.map((n) => (
            <div key={n._id} className="relative p-5 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow bg-white dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white pr-8">{n.title}</h4>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${n.targetAudience === "ALL" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" : n.targetAudience === "STUDENT" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" : n.targetAudience === "FACULTY" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}>
                    {n.targetAudience}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">{n.message}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                  {n.expiresAt && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      Expires: {new Date(n.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {n.attachment?.url && (
                    <a href={n.attachment.url} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition" title="View Attachment">
                      <Paperclip className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(n._id)} className="p-2 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition" title="Delete Notice">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
