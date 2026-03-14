import { useState } from "react";
import api from "../../services/api";

export default function CreateCourse({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    durationYears: "",
    totalSemesters: ""
  });

  const submit = async () => {
    try {
      await api.post("/courses", {
        name: form.name,
        durationYears: Number(form.durationYears),
        totalSemesters: Number(form.totalSemesters)
      });

      alert("Course created successfully");
      setForm({ name: "", durationYears: "", totalSemesters: "" });
      if (onCreated) onCreated();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating course");
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold mb-4">Create Course</h3>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Course Name"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <input
        type="number"
        className="border p-2 w-full mb-2"
        placeholder="Duration (Years)"
        value={form.durationYears}
        onChange={(e) =>
          setForm({ ...form, durationYears: e.target.value })
        }
      />

      <input
        type="number"
        className="border p-2 w-full mb-4"
        placeholder="Total Semesters"
        value={form.totalSemesters}
        onChange={(e) =>
          setForm({ ...form, totalSemesters: e.target.value })
        }
      />

      <button
        onClick={submit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Create Course
      </button>
    </div>
  );
}
