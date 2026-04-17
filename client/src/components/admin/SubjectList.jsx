import { useEffect, useState } from "react";
import api from "../../services/api";

export default function SubjectList() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/subjects")
      .then(res => setSubjects(res.data.subjects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />)}
    </div>
  );

  if (subjects.length === 0) return (
    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium py-4 text-center">No subjects created yet.</p>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/60">
          <tr className="text-left text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <th className="py-3 px-4 font-semibold">Subject</th>
            <th className="py-3 px-4 font-semibold">Code</th>
            <th className="py-3 px-4 font-semibold">Year</th>
            <th className="py-3 px-4 font-semibold">Sem</th>
            <th className="py-3 px-4 font-semibold">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {subjects.map(s => (
            <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{s.name}</td>
              <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">{s.code}</td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{s.year}</td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{s.semester}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {s.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
