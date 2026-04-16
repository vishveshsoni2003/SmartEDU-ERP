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

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently archive this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success("Notice successfully archived");
      fetchNotices(); // re-sync
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Broadcast Archive</h3>
          <p className="text-sm text-slate-500 mt-1">Review active transmissions and historical alerts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-xl bg-slate-50">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))
        ) : notices.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center py-10 bg-slate-50 rounded-xl border border-dashed">
            <Megaphone className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 text-sm">No historical notices traced.</p>
          </div>
        ) : (
          notices.map((n) => (
            <div key={n._id} className="relative p-5 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-slate-50/50 flex flex-col justify-between">

              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 pr-8">{n.title}</h4>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${n.targetAudience === "ALL" ? "bg-purple-100 text-purple-700" : n.targetAudience === "STUDENT" ? "bg-blue-100 text-blue-700" : n.targetAudience === "FACULTY" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {n.targetAudience} TARGET
                  </span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{n.message}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Broadcasted: {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                  {n.expiresAt && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      Expires: {new Date(n.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {n.attachment?.url && (
                    <a href={n.attachment.url} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="View Attachment">
                      <Paperclip className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(n._id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition" title="Delete Notice">
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
