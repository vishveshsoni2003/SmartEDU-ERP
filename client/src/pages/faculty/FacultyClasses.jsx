import React, { useState, useEffect } from 'react';
import { Users, Clock, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import LectureAttendance from '../../components/faculty/LectureAttendance';
import api from '../../services/api';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function FacultyClasses() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [activeDay, setActiveDay] = useState(
    new Date().toLocaleString("en-US", { weekday: "long" }).toUpperCase()
  );

  useEffect(() => {
    api.get("/faculty/dashboard")
      .then(res => {
        // Get ALL lectures not just today's — re-fetch without day filter
        return api.get("/lectures");
      })
      .then(res => setLectures(res.data.lectures || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = lectures.filter(l => l.day === activeDay);

  if (selectedLecture) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <button
            onClick={() => setSelectedLecture(null)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← Back to My Classes
          </button>
          <LectureAttendance
            lecture={selectedLecture}
            onClose={() => setSelectedLecture(null)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="text-blue-600 h-9 w-9" /> My Classes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            View your assigned lectures and mark attendance.
          </p>
        </div>

        {/* Day tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDay === day
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No lectures on {activeDay.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered
              .sort((a, b) => a.startTime?.localeCompare(b.startTime))
              .map((lec) => (
                <Card key={lec._id} shadow="md" padding="lg" className="hover:border-blue-200 dark:hover:border-blue-800 transition group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {lec.subjectId?.name || "Subject"}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {lec.courseId?.name || "Course"} · Y{lec.year} · Sec {lec.section}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      lec.lectureType === "PRACTICAL"
                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                        : lec.lectureType === "TUTORIAL"
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                    }`}>
                      {lec.lectureType || "THEORY"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="h-4 w-4 text-blue-500" />
                      {lec.startTime}–{lec.endTime}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedLecture(lec)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold rounded-xl text-sm transition-all group-hover:shadow-sm"
                  >
                    Mark Attendance
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Card>
              ))
            }
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
