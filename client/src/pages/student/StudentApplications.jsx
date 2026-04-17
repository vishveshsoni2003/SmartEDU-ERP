import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Send, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";

const inputCls = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors";

const STATUS_STYLES = {
  PENDING:  { bg: "bg-amber-100 dark:bg-amber-500/20",  text: "text-amber-700 dark:text-amber-400",  label: "Pending" },
  APPROVED: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", label: "Approved" },
  REJECTED: { bg: "bg-rose-100 dark:bg-rose-500/20",    text: "text-rose-700 dark:text-rose-400",    label: "Rejected" },
};

export default function StudentApplications() {
  const [form, setForm] = useState({ type: "HOSTEL_ADMISSION", title: "", description: "" });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/applications/my-applications");
      setApplications(res.data.applications || []);
    } catch { toast.error("Failed to load applications"); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error("Title and description are required");
    setSubmitting(true);
    try {
      await api.post("/applications/submit", {
        type: form.type,
        title: form.title,
        description: form.description,
        approvalRequired: form.type === "HOSTEL_ADMISSION" ? "WARDEN" : "FACULTY"
      });
      toast.success("Application submitted successfully");
      setForm({ type: "HOSTEL_ADMISSION", title: "", description: "" });
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status) => {
    const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Application Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" /> Submit New Application
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Application Type</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className={inputCls}
            >
              <option value="HOSTEL_ADMISSION">Hostel Admission</option>
              <option value="TRANSPORT">Transport Request</option>
              <option value="SCHOLARSHIP">Scholarship Application</option>
              <option value="LEAVE_OF_ABSENCE">Leave of Absence</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Brief title of your application"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Provide detailed information..."
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            {submitting
              ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send className="h-4 w-4" />
            }
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>

      {/* Applications History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Your Applications</h2>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No applications submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div
                key={app._id}
                className={`border rounded-xl p-4 transition-colors ${
                  app.status === "REJECTED" ? "border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/5" :
                  app.status === "APPROVED" ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5" :
                  "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{app.title}</h4>
                    {getStatusBadge(app.status)}
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                      {app.type?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{app.description}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Submitted: {new Date(app.createdAt).toLocaleDateString()}
                </p>
                {app.status === "REJECTED" && app.rejectionReason && (
                  <div className="mt-3 p-3 bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400">Rejection Reason:</p>
                    <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">{app.rejectionReason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
