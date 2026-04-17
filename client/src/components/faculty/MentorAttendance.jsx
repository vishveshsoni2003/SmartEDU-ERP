import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Send } from "lucide-react";
import api from "../../services/api";

export default function MentorAttendance({ mentorDetails }) {
  if (!mentorDetails || !mentorDetails.courseId) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Mentor class not assigned
        </p>
      </div>
    );
  }

  const courseId =
    typeof mentorDetails.courseId === "object"
      ? mentorDetails.courseId._id
      : mentorDetails.courseId;

  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState([]);
  const [session, setSession] = useState("MORNING");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/students", {
        params: { courseId, year: mentorDetails.year, section: mentorDetails.section }
      })
      .then(res => {
        setStudents(res.data.students || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId, mentorDetails.year, mentorDetails.section]);

  const toggle = (id) => {
    setPresent(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post("/attendance/mentor", {
        courseId,
        year: mentorDetails.year,
        section: mentorDetails.section,
        date: new Date().toISOString().split('T')[0],
        session,
        presentStudents: present
      });
      toast.success(`${session} mentor attendance saved — ${present.size} present`);
      setPresent([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={session}
          onChange={e => setSession(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        >
          <option value="MORNING">Morning</option>
          <option value="AFTERNOON">Afternoon</option>
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
            {present.length} Present
          </span>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-full">
            {students.length - present.length} Absent
          </span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {students.map(s => {
          const isPresent = present.includes(s._id);
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
              <span>{s.userId?.name} <span className="text-xs opacity-60">({s.enrollmentNo})</span></span>
              {isPresent
                ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                : <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
              }
            </button>
          );
        })}
      </div>

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
      >
        {submitting
          ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Send className="h-4 w-4" />
        }
        {submitting ? "Saving..." : `Submit ${session} Attendance`}
      </button>
    </div>
  );
}
