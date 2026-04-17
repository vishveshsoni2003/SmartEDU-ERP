import { useEffect, useState } from "react";
import api from "../../services/api";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(res.data.courses || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />)}
    </div>
  );

  return (
    <div className="space-y-2">
      {courses.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium py-4 text-center">No courses found.</p>
      ) : (
        courses.map(c => (
          <div key={c._id} className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</span>
            {c.code && <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{c.code}</span>}
          </div>
        ))
      )}
    </div>
  );
}
