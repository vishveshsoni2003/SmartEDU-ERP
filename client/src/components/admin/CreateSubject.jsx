import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function CreateSubject({ onCreated, refreshKey = 0 }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    name: "",
    code: "",
    year: "",
    semester: "",
    type: "THEORY"
  });

  useEffect(() => {
    api.get("/courses").then((res) => {
      setCourses(res.data.courses || res.data || []);
    });
  }, [refreshKey]);

  const submit = async (e) => {
    e?.preventDefault();
    const { courseId, name, code, year, semester, type } = form;

    if (!courseId || !name || !code || !year || !semester) {
      return toast.error("All subject parameters are required");
    }

    try {
      await api.post("/subjects", {
        courseId,
        name,
        code,
        year: Number(year),
        semester: Number(semester),
        type
      });

      toast.success("Subject module instantiated successfully");

      setForm({
        courseId: "",
        name: "",
        code: "",
        year: "",
        semester: "",
        type: "THEORY"
      });
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create subject");
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <select
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        value={form.courseId}
        onChange={(e) =>
          setForm({ ...form, courseId: e.target.value })
        }
      >
        <option value="">Select Target Course</option>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        placeholder="Subject Name (e.g. Data Structures)"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
          placeholder="Subject Code"
          value={form.code}
          onChange={(e) =>
            setForm({ ...form, code: e.target.value })
          }
        />

        <input
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
          placeholder="Year"
          type="number"
          value={form.year}
          onChange={(e) =>
            setForm({ ...form, year: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
          placeholder="Semester"
          type="number"
          value={form.semester}
          onChange={(e) =>
            setForm({ ...form, semester: e.target.value })
          }
        />

        <select
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
        >
          <option value="THEORY">Theory Node</option>
          <option value="LAB">Lab Practical</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
      >
        Compile Subject Definition
      </button>
    </form>
  );
}
