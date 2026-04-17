import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, CheckCircle, Clock, BookOpen, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import api from '../../services/api';

export default function FacultyAttendance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const [histRes, dashRes] = await Promise.all([
        api.get(`/attendance/lecture/history?${params}`),
        api.get("/faculty/dashboard")
      ]);

      setRecords(histRes.data.records || []);

      const today = dashRes.data?.todayLectures || [];
      setStats({
        todayLectures: today.length,
        totalRecords: histRes.data.total || 0,
        isMentor: dashRes.data?.isMentor || false,
        pendingLeaves: dashRes.data?.pendingLeaves || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const inputCls = "px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="text-blue-600 h-9 w-9" /> Attendance Records
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            View and track all your marked lecture attendance sessions.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Today's Lectures", value: stats.todayLectures, color: "blue", icon: Clock },
              { label: "Total Sessions Marked", value: stats.totalRecords, color: "emerald", icon: CheckCircle },
              { label: "Mentor Role", value: stats.isMentor ? "Active" : "None", color: "purple", icon: Users },
              { label: "Pending Leaves", value: stats.pendingLeaves, color: "amber", icon: BookOpen },
            ].map((s, i) => (
              <Card key={i} shadow="sm" padding="md">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
                  <s.icon className={`h-4 w-4 text-${s.color}-500`} />
                </div>
                <p className={`text-2xl font-black text-${s.color}-600 dark:text-${s.color}-400 mt-2`}>{s.value}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card shadow="sm" padding="md">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">From:</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inputCls} />
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">To:</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className={inputCls} />
            <button
              onClick={fetchHistory}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              Apply Filter
            </button>
            {(from || to) && (
              <button
                onClick={() => { setFrom(""); setTo(""); setTimeout(fetchHistory, 0); }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </Card>

        {/* Records Table */}
        <Card shadow="md" padding="none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" /> Attendance History
            </h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-3 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />)}
              </div>
            ) : records.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No attendance records found.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Mark lecture attendance from the dashboard to see records here.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Date</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Subject</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Course</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Year / Sec</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Time</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Present</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {records.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-700 dark:text-blue-400">
                        {r.lecture?.subject || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {r.lecture?.course || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        Y{r.lecture?.year} · {r.lecture?.section}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                        {r.lecture?.startTime}–{r.lecture?.endTime}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                          {r.presentCount} present
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
