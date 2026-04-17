import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Send, Search, CheckSquare, Square, Calendar } from "lucide-react";
import api from "../../services/api";

export default function LectureAttendance({ lecture, onClose }) {
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const courseId = lecture.courseId?._id || lecture.courseId;
    if (!courseId) {
      setLoading(false);
      return;
    }
    api
      .get("/students", {
        params: { courseId, year: lecture.year, section: lecture.section }
      })
      .then((res) => {
        setStudents(res.data.students || []);
      })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoading(false));
  }, [lecture]);

  const toggle = (id) => {
    const copy = new Set(present);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setPresent(copy);
  };

  const markAll = () => setPresent(new Set(students.map((s) => s._id)));
  const clearAll = () => setPresent(new Set());

  const submit = async () => {
    if (!date) return toast.error("Please select a date");
    setSubmitting(true);
    try {
      await api.post("/attendance/lecture", {
        lectureId: lecture._id,
        date,
        presentStudents: Array.from(present),
      });
      toast.success(`Attendance saved — ${present.size} / ${students.length} present`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.userId?.name?.toLowerCase().includes(q) ||
      s.enrollmentNo?.toLowerCase().includes(q) ||
      s.rollNo?.toLowerCase().includes(q)
    );
  });

  const inputCls =
    "px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {lecture.subjectId?.name || "Lecture"} — Mark Attendance
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {lecture.courseId?.name || "Course"} · Year {lecture.year} · Section {lecture.section} ·{" "}
          <span className="font-mono">{lecture.startTime}–{lecture.endTime}</span>
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* Date picker */}
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Stats + bulk actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
              {present.size} Present
            </span>
            <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full">
              {students.length - present.size} Absent
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition-colors"
            >
              <CheckSquare className="h-3.5 w-3.5" /> All Present
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Square className="h-3.5 w-3.5" /> Clear All
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, enrollment or roll no..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Student list */}
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {search ? "No students match your search." : "No students found in this class."}
            </p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filtered.map((s) => {
              const isPresent = present.has(s._id);
              return (
                <button
                  key={s._id}
                  onClick={() => toggle(s._id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isPresent
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="truncate">{s.userId?.name || "—"}</span>
                    <span className="text-xs opacity-50 font-mono shrink-0">{s.rollNo}</span>
                  </div>
                  {isPresent ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={submit}
            disabled={submitting || loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? "Saving..." : "Submit Attendance"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 font-bold text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
