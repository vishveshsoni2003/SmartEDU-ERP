import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Users, TrendingUp, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import api from '../../services/api';

export default function FacultyGrades() {
  const [lectures, setLectures] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch faculty's assigned lectures
        const lectureRes = await api.get("/lectures");
        const myLectures = lectureRes.data.lectures || [];
        setLectures(myLectures);

        // Fetch attendance history to get present counts per lecture
        const histRes = await api.get("/attendance/lecture/history");
        const map = {};
        (histRes.data.records || []).forEach(r => {
          const lid = r.lecture?._id;
          if (!lid) return;
          if (!map[lid]) map[lid] = { sessions: 0, totalPresent: 0 };
          map[lid].sessions += 1;
          map[lid].totalPresent += r.presentCount || 0;
        });
        setAttendanceMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group lectures by subject+course+year+section (unique class)
  const classGroups = lectures.reduce((acc, lec) => {
    const key = `${lec.subjectId?._id}-${lec.courseId?._id}-${lec.year}-${lec.section}`;
    if (!acc[key]) {
      acc[key] = {
        subject: lec.subjectId?.name || "Unknown",
        course: lec.courseId?.name || "Unknown",
        year: lec.year,
        section: lec.section,
        type: lec.lectureType || "THEORY",
        lectureIds: []
      };
    }
    acc[key].lectureIds.push(lec._id?.toString());
    return acc;
  }, {});

  const classes = Object.values(classGroups).map(cls => {
    let totalSessions = 0;
    let totalPresent = 0;
    cls.lectureIds.forEach(lid => {
      const d = attendanceMap[lid];
      if (d) {
        totalSessions += d.sessions;
        totalPresent += d.totalPresent;
      }
    });
    const avgPresent = totalSessions > 0 ? Math.round(totalPresent / totalSessions) : 0;
    return { ...cls, totalSessions, avgPresent };
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Award className="text-blue-600 h-9 w-9" /> Class Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Summary of your assigned classes and attendance performance.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No classes assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((cls, i) => (
              <Card key={i} shadow="md" padding="lg" className="hover:border-blue-200 dark:hover:border-blue-800 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cls.subject}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {cls.course} · Year {cls.year} · Section {cls.section}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    cls.type === "PRACTICAL"
                      ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                      : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  }`}>
                    {cls.type}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sessions</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cls.totalSessions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Present</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{cls.avgPresent}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lectures</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{cls.lectureIds.length}</p>
                  </div>
                </div>

                {cls.totalSessions === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
                    No attendance marked yet for this class.
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
