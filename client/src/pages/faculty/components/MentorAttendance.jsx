import { useState } from "react";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import api from "../../../services/api";

export default function MentorAttendance() {
  const [session, setSession] = useState("MORNING");
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = async () => {
    try {
      const res = await api.get("/students/my-section");
      setStudents(res.data.students || []);
    } catch {
      toast.error("Failed to load students");
    }
  };

  const submit = async () => {
    if (!students.length) return toast.error("No students loaded");
    setSubmitting(true);
    try {
      await api.post("/attendance/mentor", {
        ...students[0],
        date: new Date().toISOString().split('T')[0],
        session,
        presentStudents: present
      });
      toast.success("Mentor attendance marked");
      setPresent([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white">Mentor Attendance</h3>

      <div className="flex gap-3">
        <select
          className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
          value={session}
          onChange={e => setSession(e.target.value)}
        >
          <option value="MORNING">Morning</option>
          <option value="AFTERNOON">After Lunch</option>
        </select>
        <button
          onClick={loadStudents}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors"
        >
          Load Students
        </button>
      </div>

      {students.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {students.map(s => {
            const isPresent = present.includes(s._id);
            return (
              <label
                key={s._id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  isPresent
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isPresent}
                  onChange={() =>
                    setPresent(p =>
                      p.includes(s._id) ? p.filter(x => x !== s._id) : [...p, s._id]
                    )
                  }
                  className="w-3.5 h-3.5 accent-blue-600"
                />
                <span className="truncate">{s.userId?.name}</span>
              </label>
            );
          })}
        </div>
      )}

      <button
        onClick={submit}
        disabled={submitting || !students.length}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm"
      >
        {submitting
          ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Send className="h-4 w-4" />
        }
        {submitting ? "Saving..." : "Submit Mentor Attendance"}
      </button>
    </div>
  );
}
