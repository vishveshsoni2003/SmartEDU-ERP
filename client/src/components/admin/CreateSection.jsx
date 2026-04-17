import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function CreateSection({ onCreated, refreshKey = 0 }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    year: "",
    section: ""
  });

  useEffect(() => {
    api.get("/courses").then(res => setCourses(res.data.courses || res.data || []));
  }, [refreshKey]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.courseId || !form.year || !form.section) {
      return toast.error("Please fill all section parameters");
    }

    try {
      await api.post("/sections", form);
      toast.success("Section routing instantiated successfully");
      setForm({ ...form, year: "", section: "" });
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create section");
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <select
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm transition-colors"
        value={form.courseId}
        onChange={e => setForm({ ...form, courseId: e.target.value })}
      >
        <option value="">Select Target Course</option>
        {courses.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      <input
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm transition-colors"
        placeholder="Year (e.g. 1)"
        type="number"
        value={form.year}
        onChange={e => setForm({ ...form, year: e.target.value })}
      />

      <input
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm transition-colors"
        placeholder="Section Token (e.g. A, B, Alpha)"
        value={form.section}
        onChange={e => setForm({ ...form, section: e.target.value })}
      />

      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20">
        Construct Section Routing
      </button>
    </form>
  );
}
