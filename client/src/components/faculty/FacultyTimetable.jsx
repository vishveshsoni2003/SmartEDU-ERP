import { useEffect, useState } from "react";
import { Clock, BookOpen, Layers, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../services/api";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function FacultyTimetable({ lectures: initialLectures = [] }) {
  const [lectures, setLectures] = useState(initialLectures);
  const [loading, setLoading] = useState(!initialLectures.length);

  useEffect(() => {
    if (initialLectures.length > 0) {
      setLectures(initialLectures);
      setLoading(false);
      return;
    }
    api.get("/faculty/dashboard").then((res) => {
      setLectures(res.data.todayLectures || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [initialLectures]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 animate-pulse p-4">
      {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>)}
    </div>
  );

  return (
    <div className="overflow-x-auto pb-4 custom-scrollbar">
      <div className="min-w-[800px] grid grid-cols-6 gap-4 p-1">
        {DAYS.map(day => {
          const dayLectures = lectures.filter(l => l.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          const isToday = new Date().toLocaleString("en-US", { weekday: "long" }).toUpperCase() === day;

          return (
            <div key={day} className={`flex flex-col rounded-2xl overflow-hidden border ${isToday ? 'border-purple-300 dark:border-purple-500/50 shadow-md shadow-purple-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className={`p-3 text-center border-b ${isToday ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                <h4 className="text-xs font-black tracking-widest">{day.substring(0, 3)}</h4>
              </div>

              <div className="flex-1 p-3 bg-white dark:bg-slate-900 space-y-3 min-h-[250px]">
                {dayLectures.map((lec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-xl border relative hover:shadow-lg transition-all cursor-crosshair group ${isToday ? 'bg-purple-50/50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700'}`}
                  >
                    <p className="font-bold text-slate-800 dark:text-white text-sm break-words leading-tight flex items-center gap-1">
                      {lec.subjectId?.name || lec.subject}
                    </p>

                    <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700/50">
                      <div className="flex items-center justify-between pb-2">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{lec.startTime} - {lec.endTime}</span>
                      </div>
                      {lec.room && (
                        <div className="flex items-center justify-between pt-2">
                          <Navigation className="w-3 h-3 text-indigo-500" />
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">RM:{lec.room}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {dayLectures.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 mt-8">
                    <BookOpen className="w-6 h-6 mb-2" />
                    <span className="text-[10px] font-bold">CLEAR</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
