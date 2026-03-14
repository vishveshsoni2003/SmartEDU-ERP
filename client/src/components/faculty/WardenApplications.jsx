import { useEffect, useState } from "react";
import api from "../../services/api";
import { FileText, User, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function WardenApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/applications/pending");
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.response?.data?.message || "Failed to load applications");
    }
    setLoading(false);
  };

  const updateStatus = async (id, status, reason = "") => {
    setProcessingId(id);
    try {
      await api.patch(`/applications/${id}/status`, { status, rejectionReason: reason });
      setApplications((prev) => prev.filter((app) => app._id !== id));
      setSuccess(
        status === "APPROVED"
          ? "Application approved successfully!"
          : "Application rejected successfully!"
      );
      setSelectedApp(null);
      setRejectionReason("");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error("Error updating application status:", err);
      setError(err.response?.data?.message || "Failed to update status");
      setTimeout(() => setError(null), 4000);
    }
    setProcessingId(null);
  };

  const getTypeColor = (type) => {
    const colors = {
      HOSTEL_ADMISSION: "bg-blue-100 text-blue-800",
      TRANSPORT: "bg-purple-100 text-purple-800",
      SCHOLARSHIP: "bg-green-100 text-green-800",
      LEAVE_OF_ABSENCE: "bg-orange-100 text-orange-800",
      OTHER: "bg-slate-100 text-slate-800"
    };
    return colors[type] || colors.OTHER;
  };

  const getTypeLabel = (type) => {
    return type.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-slate-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Student Applications</h3>
        <p className="text-sm text-slate-600 mt-1">Review and process student applications</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {!applications.length ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No pending applications</p>
          <p className="text-slate-400 text-sm mt-1">All applications have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const studentName = app.studentId?.userId?.name || "Unknown Student";
            const studentEmail = app.studentId?.userId?.email || "N/A";

            return (
              <div
                key={app._id}
                className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(app.type)}`}>
                        {getTypeLabel(app.type)}
                      </span>
                    </div>

                    {/* Student Name and Title */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-600" />
                        <p className="font-semibold text-slate-900">{studentName}</p>
                      </div>
                      <p className="text-xs text-slate-500 ml-6">{studentEmail}</p>
                    </div>

                    {/* Application Title */}
                    <h4 className="font-semibold text-slate-900 mb-2">{app.title}</h4>

                    {/* Description */}
                    <p className="text-sm text-slate-700 mb-3">{app.description}</p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Submitted {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(app._id, "APPROVED")}
                      disabled={processingId === app._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === app._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedApp(app._id)}
                      disabled={processingId === app._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === app._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>

                {/* Rejection Reason Modal */}
                {selectedApp === app._id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rejection Reason (optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(app._id, "REJECTED", rejectionReason)}
                        disabled={processingId === app._id}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        {processingId === app._id ? "Processing..." : "Confirm Rejection"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApp(null);
                          setRejectionReason("");
                        }}
                        disabled={processingId === app._id}
                        className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                      >
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

      {/* Summary */}
      {applications.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-600">
            Showing <span className="font-semibold">{applications.length}</span> pending application{applications.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
