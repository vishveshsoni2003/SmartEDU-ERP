import { useEffect, useState } from "react";
import {
  getPendingHostelLeaves,
  approveHostelLeave
} from "../../services/facultyApi";
import { CheckCircle, XCircle, AlertCircle, Calendar, User, FileText, Clock } from "lucide-react";

export default function HostelApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingHostelLeaves();
      console.log("Hostel leaves response:", data);
      setLeaves(data.leaves || []);
    } catch (err) {
      console.error("Error fetching hostel leaves:", err);
      setError(err.response?.data?.message || "Failed to load requests");
    }
    setLoading(false);
  };

  const updateStatus = async (id, status, reason = "") => {
    setProcessingId(id);
    try {
      await approveHostelLeave(id, { status, rejectionReason: reason });
      setLeaves((prev) => prev.filter((l) => l._id !== id));
      setSuccess(
        status === "APPROVED"
          ? "Hostel leave request approved successfully!"
          : "Hostel leave request rejected successfully!"
      );
      setSelectedLeave(null);
      setRejectionReason("");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error("Error updating leave status:", err);
      setError(err.response?.data?.message || "Failed to update status");
      setTimeout(() => setError(null), 4000);
    }
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>
        </div>
      )}

      {!leaves.length ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => {
            const studentName = leave.studentId?.userId?.name || "Unknown Student";
            const fromDate = new Date(leave.fromDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
            const toDate   = new Date(leave.toDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
            const duration = Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / (1000*60*60*24)) + 1;

            return (
              <div key={leave._id} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{studentName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{fromDate} → {toDate}</span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded text-xs font-bold">{duration}d</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{leave.reason || "No reason"}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(leave.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateStatus(leave._id, "APPROVED")} disabled={processingId === leave._id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20">
                      {processingId === leave._id ? <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button onClick={() => setSelectedLeave(leave._id)} disabled={processingId === leave._id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all shadow-lg shadow-rose-600/20">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
                {selectedLeave === leave._id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Rejection reason (optional)..." rows={2}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 mb-3 resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(leave._id, "REJECTED", rejectionReason)} disabled={processingId === leave._id}
                        className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition">
                        {processingId === leave._id ? "Processing..." : "Confirm Rejection"}
                      </button>
                      <button onClick={() => { setSelectedLeave(null); setRejectionReason(""); }}
                        className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {leaves.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">{leaves.length}</span> pending request{leaves.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
