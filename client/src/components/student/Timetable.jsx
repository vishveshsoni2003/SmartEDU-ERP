import { useEffect, useState } from "react";
import { getStudentTimetable } from "../../services/studentApi";
import { Clock, User, BookOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function Timetable({ lectures: initialLectures = [] }) {
  const [lectures, setLectures] = useState(initialLectures);
  const [loading, setLoading] = useState(!initialLectures.length);

  useEffect(() => {
    if (initialLectures.length > 0) {
      setLectures(initialLectures);
      setLoading(false);
      return;
    }
    getStudentTimetable().then((data) => {
      setLectures(data.lectures || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [initialLectures]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 animate-pulse p-4">
      {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>)}
    </div>
  );

  if (!lectures.length) return (
    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
      <Layers className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
      <p className="text-slate-500 font-bold tracking-tight">Schedule Void</p>
      <p className="text-slate-400 text-sm mt-1 font-medium">No strict matrix bounds mapped natively.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto pb-4 custom-scrollbar">
      <div className="min-w-[800px] grid grid-cols-6 gap-4 p-1">
        {DAYS.map(day => {
          const dayLectures = lectures.filter(l => l.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          const isToday = new Date().toLocaleString("en-US", { weekday: "long" }).toUpperCase() === day;

          return (
            <div key={day} className={`flex flex-col rounded-2xl overflow-hidden border ${isToday ? 'border-blue-300 dark:border-blue-500/50 shadow-md shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className={`p-3 text-center border-b ${isToday ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                <h4 className="text-xs font-black tracking-widest">{day.substring(0, 3)}</h4>
              </div>

              <div className="flex-1 p-3 bg-white dark:bg-slate-900 space-y-3 min-h-[250px]">
                {dayLectures.map((lec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-xl border relative hover:shadow-lg transition-all cursor-crosshair group ${isToday ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700'}`}
                  >
                    <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-slate-800 dark:bg-indigo-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm">{i + 1}</div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm break-words leading-tight flex items-center gap-1">
                      {lec.subjectId?.name || lec.subject}
                    </p>

                    <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700/50">
                      <div className="flex items-center justify-between pb-2">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{lec.startTime} - {lec.endTime}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <User className="w-3 h-3 text-rose-500" />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[80px]">{lec.facultyId?.userId?.name || "-"}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
