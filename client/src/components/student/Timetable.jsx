import { useEffect, useState } from "react";
import { getStudentTimetable } from "../../services/studentApi";
import { Clock, User, BookOpen } from "lucide-react";

export default function Timetable({ lectures: initialLectures = [] }) {
  const [lectures, setLectures] = useState(initialLectures);
  const [loading, setLoading] = useState(!initialLectures.length);

  useEffect(() => {
    // If lectures are passed as prop, use them
    if (initialLectures.length > 0) {
      setLectures(initialLectures);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    getStudentTimetable()
      .then((data) => {
        setLectures(data.lectures || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [initialLectures]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          Loading schedule...
        </div>
      </div>
    );
  }

  if (!lectures.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">No classes today</p>
        <p className="text-slate-400 text-sm mt-1">Enjoy your free time!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lectures.map((lec, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-4"
        >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 flex items-center gap-2 break-words">
                  <BookOpen className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  {lec.subjectId?.name || lec.subject}
                </p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{lec.startTime} – {lec.endTime}</span>
                  </div>
                  
                  {lec.facultyId?.userId?.name && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <span>{lec.facultyId.userId.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                {i + 1}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
