import { useState, useEffect } from "react";
import api from "../../services/api";
import { Send, AlertCircle, CheckCircle } from "lucide-react";

export default function StudentApplications() {
  const [form, setForm] = useState({
    type: "HOSTEL_ADMISSION",
    title: "",
    description: ""
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/applications/my-applications");
      setApplications(res.data.applications || []);
    } catch (err) {
      setError("Failed to load applications");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      setError("Title and description are required");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/applications/submit", {
        type: form.type,
        title: form.title,
        description: form.description,
        approvalRequired: form.type === "HOSTEL_ADMISSION" ? "WARDEN" : "FACULTY"
      });

      setSuccess("Application submitted successfully!");
      setForm({ type: "HOSTEL_ADMISSION", title: "", description: "" });
      fetchApplications();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    }

    setSubmitting(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      APPROVED: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
      REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" }
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    return type.replace(/_/g, " ");
  };

  return (
    <div className="space-y-8">
      {/* Application Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Submit New Application</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Application Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="HOSTEL_ADMISSION">Hostel Admission</option>
              <option value="TRANSPORT">Transport Request</option>
              <option value="SCHOLARSHIP">Scholarship Application</option>
              <option value="LEAVE_OF_ABSENCE">Leave of Absence</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Brief title of your application"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide detailed information about your application..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>

      {/* Applications History */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Your Applications</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No applications submitted yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className={`border rounded-lg p-4 ${
                  app.status === "REJECTED"
                    ? "border-red-200 bg-red-50"
                    : app.status === "APPROVED"
                    ? "border-green-200 bg-green-50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">{app.title}</h4>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{app.description}</p>
                    <p className="text-xs text-slate-500">
                      Type: {getTypeLabel(app.type)} • Submitted: {new Date(app.createdAt).toLocaleDateString()}
                    </p>

                    {/* Rejection Reason */}
                    {app.status === "REJECTED" && app.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{app.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
