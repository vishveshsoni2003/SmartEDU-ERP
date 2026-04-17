import { useState, useEffect } from 'react';
import { Calendar, BarChart3, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const pctColor = (p) =>
  p >= 90 ? "text-emerald-600 dark:text-emerald-400" :
  p >= 75 ? "text-blue-600 dark:text-blue-400" :
  p >= 60 ? "text-amber-600 dark:text-amber-400" :
            "text-rose-600 dark:text-rose-400";

const barColor = (p) =>
  p >= 90 ? "bg-emerald-500" :
  p >= 75 ? "bg-blue-500" :
  p >= 60 ? "bg-amber-500" :
            "bg-rose-500";

export default function StudentAttendance() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch student profile to get _id
        const profileRes = await api.get("/students/me");
        const student = profileRes.data.student;
        if (!student) throw new Error("Profile not found");

        const [lectureRes, mentorRes] = await Promise.all([
          api.get(`/attendance/lecture/percentage/${student._id}`),
          api.get(`/attendance/mentor/percentage/${student._id}`)
        ]);

        const lecPct  = parseFloat(lectureRes.data?.percentage || 0);
        const mentPct = parseFloat(mentorRes.data?.percentage || 0);

        setData({
          lecture: {
            percentage: lecPct,
            total: lectureRes.data?.totalLectures || 0,
            attended: lectureRes.data?.attendedLectures || 0,
          },
          mentor: {
            percentage: mentPct,
            total: mentorRes.data?.totalSessions || 0,
            attended: mentorRes.data?.attendedSessions || 0,
          }
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load attendance");
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
        </div>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 font-medium text-sm">
        {error}
      </div>
    </DashboardLayout>
  );

  const { lecture, mentor } = data;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Calendar className="text-blue-600 h-9 w-9" /> Attendance Record
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Your lecture and mentor attendance overview.
          </p>
        </div>

        {/* Alert banner if below threshold */}
        {(lecture.percentage < 75 || mentor.percentage < 75) && (
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300">Attendance Below Threshold</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                Maintain at least 75% in both lecture and mentor sessions to avoid shortage.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Lecture */}
          <Card shadow="md" padding="lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lecture Attendance</p>
                <p className={`text-4xl font-black mt-2 ${pctColor(lecture.percentage)}`}>{lecture.percentage}%</p>
              </div>
              {lecture.percentage >= 75
                ? <TrendingUp className="h-6 w-6 text-emerald-500" />
                : <TrendingDown className="h-6 w-6 text-rose-500" />
              }
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden mb-3">
              <div className={`h-full rounded-full transition-all duration-700 ${barColor(lecture.percentage)}`} style={{ width: `${Math.min(lecture.percentage, 100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Attended</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{lecture.attended}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{lecture.total}</p>
              </div>
            </div>
          </Card>

          {/* Mentor */}
          <Card shadow="md" padding="lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mentor Attendance</p>
                <p className={`text-4xl font-black mt-2 ${pctColor(mentor.percentage)}`}>{mentor.percentage}%</p>
              </div>
              {mentor.percentage >= 75
                ? <TrendingUp className="h-6 w-6 text-emerald-500" />
                : <TrendingDown className="h-6 w-6 text-rose-500" />
              }
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden mb-3">
              <div className={`h-full rounded-full transition-all duration-700 ${barColor(mentor.percentage)}`} style={{ width: `${Math.min(mentor.percentage, 100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Attended</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{mentor.attended}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{mentor.total}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Overall status */}
        <div className={`rounded-2xl p-5 border ${
          lecture.percentage >= 75 && mentor.percentage >= 75
            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"
            : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30"
        }`}>
          <p className={`font-bold text-sm ${
            lecture.percentage >= 75 && mentor.percentage >= 75
              ? "text-emerald-800 dark:text-emerald-300"
              : "text-amber-800 dark:text-amber-300"
          }`}>
            {lecture.percentage >= 75 && mentor.percentage >= 75
              ? "✓ Your attendance is on track in both categories."
              : "⚠ One or both attendance categories are below the 75% minimum."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
