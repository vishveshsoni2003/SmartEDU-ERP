import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Send } from "lucide-react";
import api from "../../services/api";

export default function LectureAttendance({ lecture, onClose }) {
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/students?courseId=${lecture.courseId._id}&year=${lecture.year}&section=${lecture.section}`)
      .then(res => {
        setStudents(res.data.students || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lecture]);

  const toggle = (id) => {
    const copy = new Set(present);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setPresent(copy);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post("/attendance/lecture", {
        lectureId: lecture._id,
        date: new Date().toISOString().split('T')[0],
        presentStudents: Array.from(present)
      });
      toast.success(`Attendance saved — ${present.size} present`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {lecture.subjectId?.name} — Attendance
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {lecture.courseId?.name} · Year {lecture.year} · Section {lecture.section}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
            {present.size} Present
          </span>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-full">
            {students.length - present.size} Absent
          </span>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
        {students.map(s => {
          const isPresent = present.has(s._id);
          return (
            <button
              key={s._id}
              onClick={() => toggle(s._id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isPresent
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span>{s.userId?.name}</span>
              {isPresent
                ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                : <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
              }
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={submit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          {submitting
            ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Send className="h-4 w-4" />
          }
          {submitting ? "Saving..." : "Submit Attendance"}
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2.5 font-bold text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
