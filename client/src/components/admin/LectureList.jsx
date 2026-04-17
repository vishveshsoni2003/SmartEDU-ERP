import { useEffect, useState, useCallback } from "react";
import { Trash2, Edit, Clock, BookOpen, User, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const TYPE_COLORS = {
  THEORY: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  PRACTICAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  TUTORIAL: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  LAB: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
};

export default function LectureList({ refreshKey = 0, onEdit }) {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchLectures = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/lectures");
      setLectures(res.data.lectures || []);
    } catch {
      toast.error("Failed to load lectures");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures, refreshKey]);

  const handleDelete = (lecture) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-bold text-slate-900 dark:text-white">Delete this lecture?</p>
          <p className="text-sm text-slate-500">
            {lecture.subjectId?.name} · {lecture.day} {lecture.startTime}–{lecture.endTime}
          </p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setDeleting(lecture._id);
                try {
                  await api.delete(`/lectures/${lecture._id}`);
                  setLectures((prev) => prev.filter((l) => l._id !== lecture._id));
                  toast.success("Lecture deleted");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Failed to delete lecture");
                } finally {
                  setDeleting(null);
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-600/20 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (lectures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarDays className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
        <p className="text-lg font-bold text-slate-500 dark:text-slate-400">No lectures scheduled</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create a lecture using the form above.</p>
      </div>
    );
  }

  // Group by day
  const grouped = DAY_ORDER.reduce((acc, day) => {
    const dayLectures = lectures.filter((l) => l.day === day);
    if (dayLectures.length > 0) acc[day] = dayLectures;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, dayLectures]) => (
        <div key={day}>
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            {day}
          </h4>
          <div className="space-y-2">
            {dayLectures.map((l) => (
              <div
                key={l._id}
                className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-800 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs font-bold font-mono">
                      {l.startTime}–{l.endTime}
                    </span>
                  </div>

                  {/* Subject */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BookOpen className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {l.subjectId?.name || "—"}
                    </span>
                    {l.subjectId?.code && (
                      <span className="text-xs text-slate-400 font-mono shrink-0">({l.subjectId.code})</span>
                    )}
                  </div>

                  {/* Faculty */}
                  <div className="hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-medium truncate">
                      {l.facultyId?.userId?.name || l.facultyId?.employeeId || "—"}
                    </span>
                  </div>

                  {/* Course / Section */}
                  {l.courseId?.name && (
                    <span className="hidden md:block text-xs text-slate-400 dark:text-slate-500 shrink-0">
                      {l.courseId.name} · Yr {l.year} · {l.section}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Type badge */}
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${TYPE_COLORS[l.lectureType] || TYPE_COLORS.THEORY}`}>
                    {l.lectureType}
                  </span>

                  {/* Actions */}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(l)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Edit lecture"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(l)}
                    disabled={deleting === l._id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all"
                    title="Delete lecture"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
