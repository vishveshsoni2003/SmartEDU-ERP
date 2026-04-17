import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function CreateCourse({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    durationYears: "",
    totalSemesters: ""
  });

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.durationYears || !form.totalSemesters) {
      return toast.error("Please fill all generic course fields");
    }

    try {
      await api.post("/courses", {
        name: form.name,
        durationYears: Number(form.durationYears),
        totalSemesters: Number(form.totalSemesters)
      });

      toast.success("Academic master course created successfully!");
      setForm({ name: "", durationYears: "", totalSemesters: "" });
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initialize course");
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <input
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        placeholder="Course Name (e.g. Computer Science)"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <input
        type="number"
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        placeholder="Duration (Years)"
        value={form.durationYears}
        onChange={(e) =>
          setForm({ ...form, durationYears: e.target.value })
        }
      />

      <input
        type="number"
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        placeholder="Total Semesters"
        value={form.totalSemesters}
        onChange={(e) =>
          setForm({ ...form, totalSemesters: e.target.value })
        }
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
      >
        Deploy Course Architecture
      </button>
    </form>
  );
}
