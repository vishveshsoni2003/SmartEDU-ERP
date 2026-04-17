import { useEffect, useState } from "react";
import { DollarSign, CheckCircle, Clock, AlertCircle, CreditCard } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import api from "../../services/api";

const STATUS_STYLE = {
  PENDING:  "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
  PARTIAL:  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
  PAID:     "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  OVERDUE:  "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400",
  WAIVED:   "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

export default function StudentFees() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/finance/my-fees")
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load fees"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className="p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
        <p className="text-rose-700 dark:text-rose-300 font-medium">{error}</p>
      </div>
    </DashboardLayout>
  );

  const { records = [], totalDue = 0, totalPaid = 0, totalOutstanding = 0 } = data || {};

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <DollarSign className="text-emerald-600 h-9 w-9" /> My Fees
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            View your fee obligations, payment history, and outstanding dues.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Due</p>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">₹{totalDue.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Paid</p>
            </div>
            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className={`border rounded-2xl p-5 ${totalOutstanding > 0 ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-4 w-4 ${totalOutstanding > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"}`} />
              <p className={`text-xs font-black uppercase tracking-wider ${totalOutstanding > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"}`}>Outstanding</p>
            </div>
            <p className={`text-3xl font-black ${totalOutstanding > 0 ? "text-rose-700 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>₹{totalOutstanding.toLocaleString()}</p>
          </div>
        </div>

        {/* Records */}
        {records.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No fee records yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Your institution admin will add fee records when due.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => (
              <div key={r._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white">{r.label || r.category}</h3>
                      <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{r.category}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[r.status] || ""}`}>{r.status}</span>
                    </div>
                    {r.dueDate && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Due: {new Date(r.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">₹{r.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">
                    <span>Paid: ₹{r.amountPaid.toLocaleString()}</span>
                    <span>Balance: ₹{r.balance.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${r.status === "PAID" ? "bg-emerald-500" : "bg-blue-500"}`}
                      style={{ width: `${Math.min(100, r.totalAmount > 0 ? (r.amountPaid / r.totalAmount) * 100 : 0)}%` }}
                    />
                  </div>
                </div>

                {/* Payment history */}
                {r.payments?.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Payments</p>
                    <div className="space-y-1.5">
                      {r.payments.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            {new Date(p.paidOn).toLocaleDateString()} · {p.method}
                            {p.reference && <span className="ml-1 text-slate-400">({p.reference})</span>}
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">+₹{p.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
