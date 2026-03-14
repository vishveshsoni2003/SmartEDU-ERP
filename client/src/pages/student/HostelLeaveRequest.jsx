import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import api from "../../services/api";
import { Calendar, Clock, FileText, CheckCircle, AlertCircle, Send } from "lucide-react";

export default function HostelLeaveRequest() {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: ""
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hostel-leaves/my-requests");
      setRequests(res.data.requests || []);
    } catch {
      setError("Failed to load requests");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.fromDate || !form.toDate || !form.reason) {
      setError("All fields are required");
      return;
    }

    if (new Date(form.fromDate) >= new Date(form.toDate)) {
      setError("End date must be after start date");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/hostel-leaves/apply", {
        fromDate: new Date(form.fromDate),
        toDate: new Date(form.toDate),
        reason: form.reason
      });

      setSuccess("Hostel leave request submitted successfully!");
      setForm({ fromDate: "", toDate: "", reason: "" });
      fetchRequests();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
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

  return (
    <DashboardLayout>
      {/* =======================
          HEADER SECTION
      ======================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Hostel Leave Request 🏨</h1>
        <p className="text-slate-600 mt-1">Submit leave requests to your hostel warden for approval</p>
      </div>

      {/* =======================
          REQUEST FORM SECTION
      ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Submit New Request</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  From Date
                </label>
                <input
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  To Date
                </label>
                <input
                  type="date"
                  value={form.toDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={form.fromDate || new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Reason for Leave
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Provide details about your leave request..."
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
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Important Notes</h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Submit requests at least 2 days before your leave date</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Your warden will review and approve/reject your request</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>You can track the status of all your requests below</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Approved requests cannot be cancelled by you</span>
            </li>
          </ul>
        </div>
      </div>

      {/* =======================
          REQUEST HISTORY SECTION
      ======================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Your Request History</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No requests yet</p>
            <p className="text-slate-400 text-sm mt-1">Your submitted requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className={`border rounded-lg p-4 hover:shadow-md transition ${
                  req.status === "REJECTED"
                    ? "border-red-200 bg-red-50"
                    : req.status === "APPROVED"
                    ? "border-green-200 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-slate-900">
                        {new Date(req.fromDate).toLocaleDateString()} →{" "}
                        {new Date(req.toDate).toLocaleDateString()}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-sm text-slate-600">{req.reason}</p>

                    {/* Show rejection reason if rejected */}
                    {req.status === "REJECTED" && req.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{req.rejectionReason}</p>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-2">
                      Submitted: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
