import { useEffect, useState } from "react";
import api from "../../services/api";

export default function CreateSubject({ onCreated }) {
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
      setCourses(res.data.courses || []);
    });
  }, []);

  const submit = async () => {
    const { courseId, name, code, year, semester, type } = form;

    if (!courseId || !name || !code || !year || !semester) {
      return alert("All fields are required");
    }

    await api.post("/subjects", {
      courseId,
      name,
      code,
      year: Number(year),
      semester: Number(semester),
      type
    });

    alert("Subject created successfully");

    setForm({
      courseId: "",
      name: "",
      code: "",
      year: "",
      semester: "",
      type: "THEORY"
    });
    if (onCreated) onCreated();
  };

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold mb-4">Create Subject</h3>

      {/* COURSE */}
      <select
        className="border p-2 w-full mb-2"
        value={form.courseId}
        onChange={(e) =>
          setForm({ ...form, courseId: e.target.value })
        }
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* SUBJECT NAME */}
      <input
        className="border p-2 w-full mb-2"
        placeholder="Subject Name"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      {/* SUBJECT CODE */}
      <input
        className="border p-2 w-full mb-2"
        placeholder="Subject Code"
        value={form.code}
        onChange={(e) =>
          setForm({ ...form, code: e.target.value })
        }
      />

      {/* YEAR */}
      <input
        className="border p-2 w-full mb-2"
        placeholder="Year"
        type="number"
        value={form.year}
        onChange={(e) =>
          setForm({ ...form, year: e.target.value })
        }
      />

      {/* SEMESTER */}
      <input
        className="border p-2 w-full mb-2"
        placeholder="Semester"
        type="number"
        value={form.semester}
        onChange={(e) =>
          setForm({ ...form, semester: e.target.value })
        }
      />

      {/* TYPE */}
      <select
        className="border p-2 w-full mb-4"
        value={form.type}
        onChange={(e) =>
          setForm({ ...form, type: e.target.value })
        }
      >
        <option value="THEORY">Theory</option>
        <option value="LAB">Lab</option>
      </select>

      <button
        onClick={submit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Create Subject
      </button>
    </div>
  );
}
