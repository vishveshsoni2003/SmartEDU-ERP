import { useEffect, useState } from "react";
import api from "../../services/api";

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

  useEffect(() => {
    api.get("/courses").then(res => setCourses(res.data.courses));
    api.get("/subjects").then(res => setSubjects(res.data.subjects));
    api.get("/faculty").then(res => setFaculty(res.data.faculty));
  }, []);

  const submit = async () => {
    await api.post("/lectures", form);
    alert("Lecture created");
    if (onCreated) onCreated();
  };

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold mb-4">Create Lecture</h3>

      <select className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, courseId: e.target.value })}>
        <option value="">Course</option>
        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      <select className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, subjectId: e.target.value })}>
        <option value="">Subject</option>
        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>

      <select
        className="border p-2 w-full mb-2"
        onChange={(e) =>
          setForm({ ...form, facultyId: e.target.value })
        }
      >
        <option value="">Select Faculty</option>
        {faculty.map((f) => (
          <option key={f._id} value={f._id}>
            {f.userId?.name} ({f.employeeId})
          </option>
        ))}
      </select>

      <input className="border p-2 w-full mb-2" placeholder="Year"
        onChange={e => setForm({ ...form, year: e.target.value })} />

      <input className="border p-2 w-full mb-2" placeholder="Section"
        onChange={e => setForm({ ...form, section: e.target.value })} />

      <input className="border p-2 w-full mb-2" placeholder="Day (MONDAY)"
        onChange={e => setForm({ ...form, day: e.target.value })} />

      <input className="border p-2 w-full mb-2" placeholder="Start Time (10:00)"
        onChange={e => setForm({ ...form, startTime: e.target.value })} />

      <input className="border p-2 w-full mb-3" placeholder="End Time (11:00)"
        onChange={e => setForm({ ...form, endTime: e.target.value })} />

      <button onClick={submit}
        className="bg-black text-white px-4 py-2 rounded">
        Create Lecture
      </button>
    </div>
  );
}
