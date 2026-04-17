import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock,
  Plus, CreditCard, Trash2, Search, Filter, ChevronDown
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ["TUITION", "HOSTEL", "TRANSPORT", "EXAM", "LIBRARY", "MISC"];
const STATUSES    = ["PENDING", "PARTIAL", "PAID", "OVERDUE", "WAIVED"];
const METHODS     = ["CASH", "ONLINE", "CHEQUE", "DD"];

const STATUS_STYLE = {
  PENDING:  "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
  PARTIAL:  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
  PAID:     "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  OVERDUE:  "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400",
  WAIVED:   "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

const inputCls = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-colors";
const labelCls = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

/* ─── Create Fee Record Modal ─── */
function CreateFeeModal({ onClose, onCreated }) {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: "", category: "TUITION", label: "", totalAmount: "", dueDate: ""
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/students?limit=200").then(r => setStudents(r.data.students || []));
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return !q || s.userId?.name?.toLowerCase().includes(q) || s.enrollmentNo?.toLowerCase().includes(q);
  });

  const submit = async () => {
    if (!form.studentId || !form.category || !form.totalAmount) {
      return toast.error("Student, category, and amount are required");
    }
    setSaving(true);
    try {
      await api.post("/finance/records", form);
      toast.success("Fee record created");
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create record");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">New Fee Record</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {/* Student search */}
          <div>
            <label className={labelCls}>Search Student</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or enrollment no..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Student <span className="text-rose-500">*</span></label>
            <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} className={inputCls}>
              <option value="">Select student</option>
              {filtered.map(s => (
                <option key={s._id} value={s._id}>
                  {s.userId?.name} — {s.enrollmentNo}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Category <span className="text-rose-500">*</span></label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Amount (₹) <span className="text-rose-500">*</span></label>
              <input type="number" min="1" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} placeholder="0" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Label / Description</label>
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Sem 1 2025-26 Tuition" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">Cancel</button>
            <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all">
              {saving ? "Saving..." : "Create Record"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Record Payment Modal ─── */
function PaymentModal({ record, onClose, onPaid }) {
  const [form, setForm] = useState({ amount: "", method: "ONLINE", reference: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.amount || Number(form.amount) <= 0) return toast.error("Enter valid amount");
    if (Number(form.amount) > record.balance) return toast.error(`Max payable: ₹${record.balance}`);
    setSaving(true);
    try {
      await api.post(`/finance/records/${record._id}/pay`, form);
      toast.success("Payment recorded");
      onPaid();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Record Payment</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-sm space-y-1.5">
            <p className="font-semibold text-slate-900 dark:text-white">{record.studentId?.userId?.name}</p>
            <p className="text-slate-500 dark:text-slate-400">{record.category} — {record.label}</p>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500 dark:text-slate-400">Balance due:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">₹{record.balance?.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Amount (₹)</label>
            <input type="number" min="1" max={record.balance} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Method</label>
              <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className={inputCls}>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Reference</label>
              <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="Txn ID / Cheque No" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">Cancel</button>
            <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all">
              {saving ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdminFinance() {
  const [summary, setSummary]   = useState(null);
  const [records, setRecords]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [payTarget, setPayTarget]   = useState(null);

  const [filters, setFilters] = useState({ status: "", category: "" });

  const fetchSummary = async () => {
    try {
      const r = await api.get("/finance/summary");
      setSummary(r.data);
    } catch { /* silent */ }
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filters.status)   params.append("status", filters.status);
      if (filters.category) params.append("category", filters.category);
      const r = await api.get(`/finance/records?${params}`);
      setRecords(r.data.records || []);
      setTotal(r.data.total || 0);
      setPages(r.data.pages || 1);
    } catch { toast.error("Failed to load records"); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchSummary(); }, []);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-slate-900 dark:text-white">Delete this fee record?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg text-sm font-bold">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/finance/records/${id}`);
              toast.success("Record deleted");
              fetchRecords(); fetchSummary();
            } catch { toast.error("Failed to delete"); }
          }} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold">Delete</button>
        </div>
      </div>
    ), { duration: Infinity, position: "top-center" });
  };

  const handleRefresh = () => { fetchRecords(); fetchSummary(); };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <DollarSign className="text-emerald-600 h-9 w-9" /> Finance
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage fee records, track payments, and monitor dues.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" /> New Fee Record
          </button>
        </div>

        {/* Summary Stats */}
        {summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Due" value={`₹${(summary.totalDue / 1000).toFixed(1)}K`} icon={DollarSign} delay={0.1} />
            <StatCard title="Collected" value={`₹${(summary.totalCollected / 1000).toFixed(1)}K`} icon={CheckCircle} delay={0.2} />
            <StatCard title="Outstanding" value={`₹${(summary.totalPending / 1000).toFixed(1)}K`} icon={Clock} trendDirection="down" delay={0.3} />
            <StatCard title="Overdue Records" value={summary.overdueCount} icon={AlertCircle} trendDirection="down" delay={0.4} />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        )}

        {/* Category Breakdown */}
        {summary?.byCategory && Object.keys(summary.byCategory).length > 0 && (
          <Card shadow="sm" padding="lg">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Collection by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(summary.byCategory).map(([cat, data]) => {
                const pct = data.due > 0 ? Math.round((data.collected / data.due) * 100) : 0;
                return (
                  <div key={cat} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{cat}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">₹{(data.collected / 1000).toFixed(1)}K</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pct}% of ₹{(data.due / 1000).toFixed(1)}K</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Filters + Table */}
        <Card shadow="md" padding="none">
          {/* Filter bar */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={filters.status}
              onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filters.category}
              onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">{total} records</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-3 animate-pulse">
                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />)}
              </div>
            ) : records.length === 0 ? (
              <div className="py-16 text-center">
                <DollarSign className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No fee records found.</p>
                <button onClick={() => setShowCreate(true)} className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">
                  Create first record →
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    {["Student", "Category", "Label", "Total", "Paid", "Balance", "Due Date", "Status", ""].map(h => (
                      <th key={h} className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {records.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">{r.studentId?.userId?.name || "—"}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{r.studentId?.enrollmentNo}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{r.category}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs max-w-[120px] truncate">{r.label || "—"}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">₹{r.totalAmount?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">₹{r.amountPaid?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-rose-600 dark:text-rose-400 font-bold">₹{r.balance?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[r.status] || ""}`}>{r.status}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          {r.status !== "PAID" && r.status !== "WAIVED" && (
                            <button
                              onClick={() => setPayTarget(r)}
                              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                              title="Record payment"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                            title="Delete record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Prev</button>
                <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Next</button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateFeeModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); handleRefresh(); }}
        />
      )}
      {payTarget && (
        <PaymentModal
          record={payTarget}
          onClose={() => setPayTarget(null)}
          onPaid={() => { setPayTarget(null); handleRefresh(); }}
        />
      )}
    </DashboardLayout>
  );
}
