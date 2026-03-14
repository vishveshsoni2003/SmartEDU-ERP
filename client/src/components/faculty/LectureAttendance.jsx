import { useEffect, useState } from "react";
import api from "../../services/api";

export default function LectureAttendance({ lecture, onClose }) {
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch students of this lecture's class
    api
      .get(
        `/students?courseId=${lecture.courseId._id}&year=${lecture.year}&section=${lecture.section}`
      )
      .then((res) => {
        setStudents(res.data.students || []);
        setLoading(false);
      });
  }, [lecture]);

  const toggle = (id) => {
    const copy = new Set(present);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setPresent(copy);
  };

  const submit = async () => {
    const payload = {
      lectureId: lecture._id,
      date: new Date().toISOString().split('T')[0], // Send as YYYY-MM-DD
      presentStudents: Array.from(present)
    };

    await api.post("/attendance/lecture", payload);
    alert("Attendance saved");
    onClose();
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border">
        Loading students...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border">
      <h3 className="font-semibold mb-3">
        {lecture.subjectId.name} — Attendance
      </h3>

      <p className="text-sm text-slate-600 mb-4">
        {lecture.courseId.name} |
        Year {lecture.year} |
        Section {lecture.section}
      </p>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {students.map((s) => (
          <div
            key={s._id}
            className="flex justify-between items-center border-b py-2"
          >
            <span>{s.userId.name}</span>

            <button
              onClick={() => toggle(s._id)}
              className={`px-3 py-1 rounded text-sm ${
                present.has(s._id)
                  ? "bg-green-600 text-white"
                  : "bg-slate-200"
              }`}
            >
              {present.has(s._id) ? "Present" : "Absent"}
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={submit}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Submit
        </button>

        <button
          onClick={onClose}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
