import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Send } from "lucide-react";
import api from "../../../services/api";

export default function MarkLectureAttendance({ lecture }) {
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/students", {
      params: {
        courseId: lecture.courseId,
        year: lecture.year,
        section: lecture.section
      }
    }).then(res => setStudents(res.data.students || []));
  }, [lecture]);

  const toggle = (id) => {
    setPresent(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post("/attendance/lecture", {
        lectureId: lecture._id,
        date: new Date().toISOString().split('T')[0],
        presentStudents: present
      });
      toast.success(`Attendance saved — ${present.length} present`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <p className="font-bold text-slate-900 dark:text-white">
          {lecture.startTime}–{lecture.endTime} · {lecture.subjectId?.name}
        </p>
        <div className="flex gap-2 mt-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
            {present.length} Present
          </span>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-full">
            {students.length - present.length} Absent
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
        {students.map(s => {
          const isPresent = present.includes(s._id);
          return (
            <button
              key={s._id}
              onClick={() => toggle(s._id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isPresent
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isPresent
                ? <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                : <XCircle className="h-3.5 w-3.5 shrink-0 opacity-40" />
              }
              <span className="truncate">{s.userId?.name}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm"
      >
        {submitting
          ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Send className="h-4 w-4" />
        }
        {submitting ? "Saving..." : "Submit Attendance"}
      </button>
    </div>
  );
}
