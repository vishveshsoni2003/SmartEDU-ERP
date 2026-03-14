import { useEffect, useState } from "react";
import api from "../../services/api";

export default function CreateSection({ onCreated }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    year: "",
    section: ""
  });

  useEffect(() => {
    api.get("/courses").then(res => setCourses(res.data.courses));
  }, []);

  const submit = async () => {
    await api.post("/sections", form);
    alert("Section created");
    if (onCreated) onCreated();
  };

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold mb-4">Create Section</h3>

      <select
        className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, courseId: e.target.value })}
      >
        <option value="">Select Course</option>
        {courses.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Year"
        onChange={e => setForm({ ...form, year: e.target.value })}
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Section (A/B/C)"
        onChange={e => setForm({ ...form, section: e.target.value })}
      />

      <button onClick={submit} className="bg-black text-white px-4 py-2 rounded">
        Create
      </button>
    </div>
  );
}
