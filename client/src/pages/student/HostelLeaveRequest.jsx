import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import toast from "react-hot-toast";
import api from "../../services/api";
import { Calendar, Clock, FileText, Send, Home } from "lucide-react";

const inputCls = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-colors";
const labelCls = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5";

const STATUS_STYLE = {
  PENDING:  "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400",
};

export default function HostelLeaveRequest() {
  const [form, setForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hostel-leaves/my-requests");
      setRequests(res.data.requests || []);
    } catch { toast.error("Failed to load requests"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason) return toast.error("All fields are required");
    if (new Date(form.fromDate) >= new Date(form.toDate)) return toast.error("End date must be after start date");

    setSubmitting(true);
    try {
      await api.post("/hostel-leaves/apply", {
        fromDate: new Date(form.fromDate),
        toDate: new Date(form.toDate),
        reason: form.reason
      });
      toast.success("Leave request submitted successfully");
      setForm({ fromDate: "", toDate: "", reason: "" });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Home className="text-blue-600 h-9 w-9" /> Hostel Leave Request
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Submit leave requests to your warden for approval.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 dark:text-white mb-5 text-lg">New Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}><Calendar className="h-3.5 w-3.5" /> From Date</label>
                    <input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} className={inputCls} min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div>
                    <label className={labelCls}><Calendar className="h-3.5 w-3.5" /> To Date</label>
                    <input type="date" value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} className={inputCls} min={form.fromDate || new Date().toISOString().split("T")[0]} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}><FileText className="h-3.5 w-3.5" /> Reason</label>
                  <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Provide details about your leave request..." rows={4} className={`${inputCls} resize-none`} />
                </div>
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                  {submitting ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/30 p-6">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-4">Important Notes</h3>
            <ul className="space-y-3 text-sm text-blue-800 dark:text-blue-300">
              {[
                "Submit at least 2 days before your leave date",
                "Your warden will approve or reject the request",
                "Track status of all requests below",
                "Approved requests cannot be cancelled",
              ].map((note, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold shrink-0">✓</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5 text-lg">Request History</h2>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No requests submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req._id} className={`border rounded-xl p-4 transition-colors ${
                  req.status === "REJECTED" ? "border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/5" :
                  req.status === "APPROVED" ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5" :
                  "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30"
                }`}>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {new Date(req.fromDate).toLocaleDateString()} → {new Date(req.toDate).toLocaleDateString()}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[req.status] || ""}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{req.reason}</p>
                  {req.status === "REJECTED" && req.rejectionReason && (
                    <div className="mt-3 p-3 bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
                      <p className="text-xs font-bold text-rose-700 dark:text-rose-400">Rejection Reason:</p>
                      <p className="text-sm text-rose-700 dark:text-rose-300 mt-0.5">{req.rejectionReason}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Submitted: {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
