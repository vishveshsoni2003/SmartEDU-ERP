import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserCheck } from "lucide-react";
import api from "../../services/api";

export default function AssignMentor() {
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    facultyId: "",
    courseId: "",
    year: "",
    semester: "",
    section: ""
  });

  useEffect(() => {
    api.get("/faculty").then(res => setFaculty(res.data.faculty || []));
    api.get("/courses").then(res => setCourses(res.data.courses || []));
  }, []);

  useEffect(() => {
    if (form.courseId && form.year) {
      api
        .get(`/sections?courseId=${form.courseId}&year=${form.year}`)
        .then(res => setSections(res.data.sections || []));
    } else {
      setSections([]);
    }
  }, [form.courseId, form.year]);

  const selectCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const submit = async () => {
    const { facultyId, courseId, year, semester, section } = form;
    if (!facultyId || !courseId || !year || !semester || !section) {
      return toast.error("All fields are required");
    }

    setSubmitting(true);
    try {
      await api.post("/mentors/assign", form);
      toast.success("Mentor assigned successfully");
      setForm({ facultyId: "", courseId: "", year: "", semester: "", section: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign mentor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <select
        className={selectCls}
        value={form.facultyId}
        onChange={e => setForm({ ...form, facultyId: e.target.value })}
      >
        <option value="">Select Faculty</option>
        {faculty.map(f => (
          <option key={f._id} value={f._id}>
            {f.userId?.name} ({f.employeeId})
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={form.courseId}
        onChange={e => setForm({ ...form, courseId: e.target.value, year: "", semester: "", section: "" })}
      >
        <option value="">Select Course</option>
        {courses.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      <select
        className={selectCls}
        disabled={!form.courseId}
        value={form.year}
        onChange={e => setForm({ ...form, year: Number(e.target.value), semester: "", section: "" })}
      >
        <option value="">Select Year</option>
        {[1, 2, 3, 4].map(y => (
          <option key={y} value={y}>Year {y}</option>
        ))}
      </select>

      <select
        className={selectCls}
        disabled={!form.year}
        value={form.semester}
        onChange={e => setForm({ ...form, semester: Number(e.target.value) })}
      >
        <option value="">Select Semester</option>
        {form.year && [
          <option key={1} value={form.year * 2 - 1}>Semester {form.year * 2 - 1}</option>,
          <option key={2} value={form.year * 2}>Semester {form.year * 2}</option>
        ]}
      </select>

      <select
        className={selectCls}
        disabled={!sections.length}
        value={form.section}
        onChange={e => setForm({ ...form, section: e.target.value })}
      >
        <option value="">Select Section</option>
        {sections.map(s => (
          <option key={s._id} value={s.section}>Section {s.section}</option>
        ))}
      </select>

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-2"
      >
        {submitting ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )}
        {submitting ? "Assigning..." : "Assign Mentor"}
      </button>
    </div>
  );
}
