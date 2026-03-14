import { useEffect, useState } from "react";
import api from "../../services/api";

export default function MentorAttendance({ mentorDetails }) {
  if (!mentorDetails || !mentorDetails.courseId) {
    return (
      <div className="bg-white border rounded-xl p-4">
        <p className="text-slate-500">
          Mentor class not assigned
        </p>
      </div>
    );
  }

  const courseId =
    typeof mentorDetails.courseId === "object"
      ? mentorDetails.courseId._id
      : mentorDetails.courseId;

  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState([]);
  const [session, setSession] = useState("MORNING");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/students", {
        params: {
          courseId,
          year: mentorDetails.year,
          section: mentorDetails.section
        }
      })
      .then(res => {
        setStudents(res.data.students || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId, mentorDetails.year, mentorDetails.section]);

  const toggle = (id) => {
    setPresent(p =>
      p.includes(id)
        ? p.filter(x => x !== id)
        : [...p, id]
    );
  };

  const submit = async () => {
    await api.post("/attendance/mentor", {
      courseId,
      year: mentorDetails.year,
      section: mentorDetails.section,
      date: new Date().toISOString().split('T')[0], // Send as YYYY-MM-DD
      session,
      presentStudents: present
    });

    alert(`Mentor attendance marked (${session})`);
    setPresent([]);
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-4">
        <p className="text-slate-500">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-semibold mb-3">Mentor Attendance</h3>

      <select
        value={session}
        onChange={(e) => setSession(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
      >
        <option value="MORNING">Morning</option>
        <option value="AFTERNOON">Afternoon</option>
      </select>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {students.map((s) => (
          <label key={s._id} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={present.includes(s._id)}
              onChange={() => toggle(s._id)}
            />
            {s.userId?.name} ({s.enrollmentNo})
          </label>
        ))}
      </div>

      <button
        onClick={submit}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
      >
        Submit {session} Attendance
      </button>
    </div>
  );
}
