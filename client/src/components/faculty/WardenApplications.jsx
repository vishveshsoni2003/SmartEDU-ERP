import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { FileText, User, Clock, CheckCircle, XCircle, History, Filter } from "lucide-react";

const TYPE_STYLE = {
  HOSTEL_ADMISSION: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
  TRANSPORT:        "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400",
  SCHOLARSHIP:      "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  LEAVE_OF_ABSENCE: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
  OTHER:            "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

const STATUS_STYLE = {
  APPROVED: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400",
  PENDING:  "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
};

const inputCls = "px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";

export default function WardenApplications() {
  const [tab, setTab] = useState("PENDING"); // PENDING | HISTORY
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [histTotal, setHistTotal] = useState(0);
  const [histPage, setHistPage] = useState(1);
  const [histPages, setHistPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [histFilters, setHistFilters] = useState({ status: "", type: "" });

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/applications/pending");
      setPending(r.data.applications || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load applications");
    } finally { setLoading(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: histPage, limit: 15 });
      if (histFilters.status) params.append("status", histFilters.status);
      if (histFilters.type)   params.append("type",   histFilters.type);
      const r = await api.get(`/applications/history?${params}`);
      setHistory(r.data.applications || []);
      setHistTotal(r.data.total || 0);
      setHistPages(r.data.pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load history");
    } finally { setLoading(false); }
  }, [histPage, histFilters]);

  useEffect(() => {
    if (tab === "PENDING") fetchPending();
    else fetchHistory();
  }, [tab, fetchPending, fetchHistory]);

  const updateStatus = async (id, status, reason = "") => {
    setProcessingId(id);
    try {
      await api.patch(`/applications/${id}/status`, { status, rejectionReason: reason });
      toast.success(status === "APPROVED" ? "Application approved" : "Application rejected");
      setPending(prev => prev.filter(a => a._id !== id));
      setSelectedApp(null);
      setRejectionReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally { setProcessingId(null); }
  };

  const tabCls = (active) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
      active
        ? "bg-white dark:bg-slate-800 shadow-sm text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
    }`;

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl w-max border border-slate-200 dark:border-slate-800">
        <button onClick={() => setTab("PENDING")} className={tabCls(tab === "PENDING")}>
          <Clock className="h-4 w-4" /> Pending
          {pending.length > 0 && tab !== "PENDING" && (
            <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold">{pending.length}</span>
          )}
        </button>
        <button onClick={() => setTab("HISTORY")} className={tabCls(tab === "HISTORY")}>
          <History className="h-4 w-4" /> History
        </button>
      </div>

      {/* ── PENDING TAB ── */}
      {tab === "PENDING" && (
        loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No pending applications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(app => (
              <div key={app._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_STYLE[app.type] || TYPE_STYLE.OTHER}`}>
                        {app.type?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-slate-400 shrink-0" />
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{app.studentId?.userId?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{app.studentId?.userId?.email}</p>
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{app.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{app.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(app._id, "APPROVED")}
                      disabled={processingId === app._id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                    >
                      {processingId === app._id ? <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedApp(app._id === selectedApp ? null : app._id)}
                      disabled={processingId === app._id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-rose-600/20"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
                {selectedApp === app._id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <textarea
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Rejection reason (optional)..."
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 mb-3 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(app._id, "REJECTED", rejectionReason)} disabled={processingId === app._id} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                        Confirm Rejection
                      </button>
                      <button onClick={() => { setSelectedApp(null); setRejectionReason(""); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "HISTORY" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={histFilters.status}
              onChange={e => { setHistFilters(f => ({ ...f, status: e.target.value })); setHistPage(1); }}
              className={inputCls}
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={histFilters.type}
              onChange={e => { setHistFilters(f => ({ ...f, type: e.target.value })); setHistPage(1); }}
              className={inputCls}
            >
              <option value="">All Types</option>
              {["HOSTEL_ADMISSION","TRANSPORT","SCHOLARSHIP","LEAVE_OF_ABSENCE","OTHER"].map(t => (
                <option key={t} value={t}>{t.replace(/_/g," ")}</option>
              ))}
            </select>
            <span className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">{histTotal} records</span>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="font-bold text-slate-500 dark:text-slate-400">No processed applications yet.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {history.map(app => (
                  <div key={app._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_STYLE[app.type] || TYPE_STYLE.OTHER}`}>{app.type?.replace(/_/g," ")}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[app.status] || ""}`}>{app.status}</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{app.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{app.studentId?.userId?.name}</p>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{new Date(app.updatedAt).toLocaleDateString()}</p>
                    </div>
                    {app.status === "REJECTED" && app.rejectionReason && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 pl-1 border-l-2 border-rose-300 dark:border-rose-500/50">
                        {app.rejectionReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {histPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Page {histPage} of {histPages}</p>
                  <div className="flex gap-2">
                    <button disabled={histPage <= 1} onClick={() => setHistPage(p => p - 1)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Prev</button>
                    <button disabled={histPage >= histPages} onClick={() => setHistPage(p => p + 1)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
