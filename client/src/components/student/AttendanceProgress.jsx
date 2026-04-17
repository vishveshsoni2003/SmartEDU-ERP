import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function AttendanceProgress({ lecture, mentor }) {
  const isLectureGood = lecture >= 75;
  const isMentorGood = mentor >= 75;

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-500';
    if (percentage >= 75) return 'from-blue-500 to-cyan-500';
    if (percentage >= 60) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-rose-500';
  };

  const getStatusText = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Critical';
  };

  const getStatusIcon = (percentage) => {
    return percentage >= 75 ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <AlertCircle className="w-5 h-5 text-orange-600" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Lecture Attendance */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Lecture Attendance</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{lecture}%</p>
          </div>
          {getStatusIcon(lecture)}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden mb-2">
          <div className={`h-full bg-gradient-to-r ${getProgressColor(lecture)} transition-all duration-700`} style={{ width: `${Math.min(lecture, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-600 dark:text-slate-400">{getStatusText(lecture)}</span>
          <span className={isLectureGood ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
            {isLectureGood ? "On track" : "Below 75% target"}
          </span>
        </div>
      </div>

      {/* Mentor Attendance */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mentor Attendance</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{mentor}%</p>
          </div>
          {getStatusIcon(mentor)}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden mb-2">
          <div className={`h-full bg-gradient-to-r ${getProgressColor(mentor)} transition-all duration-700`} style={{ width: `${Math.min(mentor, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-600 dark:text-slate-400">{getStatusText(mentor)}</span>
          <span className={isMentorGood ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
            {isMentorGood ? "On track" : "Below 75% target"}
          </span>
        </div>
      </div>

      {/* Overall */}
      <div className={`rounded-xl p-4 ${isLectureGood && isMentorGood
        ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30"
        : "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30"
      }`}>
        <p className={`text-sm font-bold ${isLectureGood && isMentorGood
          ? "text-emerald-800 dark:text-emerald-400"
          : "text-amber-800 dark:text-amber-400"
        }`}>
          {isLectureGood && isMentorGood
            ? "✓ Your attendance is on track"
            : "⚠ Maintain at least 75% in both lecture and mentor sessions"}
        </p>
      </div>
    </div>
  );
}
