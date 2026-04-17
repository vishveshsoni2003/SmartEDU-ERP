import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarPlus } from "lucide-react";
import api from "../../services/api";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function CreateLecture({ onCreated }) {
  const [form, setForm] = useState({
    courseId: "",
    subjectId: "",
    facultyId: "",
    year: "",
    section: "",
    day: "",
    startTime: "",
    endTime: "",
    lectureType: "THEORY"
  });
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/courses").then(res => setCourses(res.data.courses || []));
    api.get("/subjects").then(res => setSubjects(res.data.subjects || []));
    api.get("/faculty").then(res => setFaculty(res.data.faculty || []));
  }, []);

  const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors";

  const submit = async () => {
    const { courseId, subjectId, facultyId, year, section, day, startTime, endTime } = form;
    if (!courseId || !subjectId || !facultyId || !year || !section || !day || !startTime || !endTime) {
      return toast.error("All fields are required");
    }

    setSubmitting(true);
    try {
      await api.post("/lectures", form);
      toast.success("Lecture scheduled successfully");
      setForm({ courseId: "", subjectId: "", facultyId: "", year: "", section: "", day: "", startTime: "", endTime: "", lectureType: "THEORY" });
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create lecture");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <select className={inputCls} value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
        <option value="">Select Course</option>
        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      <select className={inputCls} value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
        <option value="">Select Subject</option>
        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>

      <select className={inputCls} value={form.facultyId} onChange={e => setForm({ ...form, facultyId: e.target.value })}>
        <option value="">Select Faculty</option>
        {faculty.map(f => (
          <option key={f._id} value={f._id}>{f.userId?.name} ({f.employeeId})</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input
          className={inputCls}
          placeholder="Year (e.g. 1)"
          value={form.year}
          onChange={e => setForm({ ...form, year: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="Section (e.g. A)"
          value={form.section}
          onChange={e => setForm({ ...form, section: e.target.value })}
        />
      </div>

      <select className={inputCls} value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
        <option value="">Select Day</option>
        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input
          className={inputCls}
          placeholder="Start (10:00)"
          value={form.startTime}
          onChange={e => setForm({ ...form, startTime: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="End (11:00)"
          value={form.endTime}
          onChange={e => setForm({ ...form, endTime: e.target.value })}
        />
      </div>

      <select className={inputCls} value={form.lectureType} onChange={e => setForm({ ...form, lectureType: e.target.value })}>
        <option value="THEORY">Theory</option>
        <option value="PRACTICAL">Practical</option>
        <option value="TUTORIAL">Tutorial</option>
      </select>

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
      >
        {submitting ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <CalendarPlus className="h-4 w-4" />
        )}
        {submitting ? "Scheduling..." : "Schedule Lecture"}
      </button>
    </div>
  );
}
