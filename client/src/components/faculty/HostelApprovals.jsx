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
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-slate-600">Loading hostel leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Hostel Leave Approvals</h3>
        <p className="text-sm text-slate-600 mt-1">Review and approve student leave requests</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {!leaves.length ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No pending requests</p>
          <p className="text-slate-400 text-sm mt-1">All hostel leave requests have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => {
            const studentName = leave.studentId?.userId?.name || "Unknown Student";
            const fromDate = new Date(leave.fromDate).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric"
            });
            const toDate = new Date(leave.toDate).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric"
            });
            const duration = Math.ceil(
              (new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24)
            ) + 1;

            return (
              <div
                key={leave._id}
                className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Student Name */}
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-slate-600" />
                      <p className="font-semibold text-slate-900">{studentName}</p>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {fromDate} <span className="text-slate-500 mx-1">→</span> {toDate}
                      </span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {duration} day{duration > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Reason:</p>
                        <p className="text-slate-700 mt-1">{leave.reason || "No reason provided"}</p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                      <Clock className="w-3 h-3" />
                      Submitted {new Date(leave.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(leave._id, "APPROVED")}
                      disabled={processingId === leave._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === leave._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedLeave(leave._id)}
                      disabled={processingId === leave._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === leave._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>

                {/* Rejection Reason Modal */}
                {selectedLeave === leave._id && (
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
                        onClick={() => updateStatus(leave._id, "REJECTED", rejectionReason)}
                        disabled={processingId === leave._id}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        {processingId === leave._id ? "Processing..." : "Confirm Rejection"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeave(null);
                          setRejectionReason("");
                        }}
                        disabled={processingId === leave._id}
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
      {leaves.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-600">
            Showing <span className="font-semibold">{leaves.length}</span> pending request{leaves.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
