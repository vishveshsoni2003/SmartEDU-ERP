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
    <div className="space-y-6">
      {/* Lecture Attendance */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Lecture Attendance</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">{lecture}%</p>
          </div>
          {getStatusIcon(lecture)}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-3">
          <div
            className={`h-full bg-gradient-to-r ${getProgressColor(lecture)} transition-all duration-500`}
            style={{ width: `${lecture}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">{getStatusText(lecture)}</span>
          <span className="text-xs text-slate-500">{isLectureGood ? '✓ On track' : '⚠ Below target'}</span>
        </div>
      </div>

      {/* Mentor Attendance */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Mentor Attendance</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">{mentor}%</p>
          </div>
          {getStatusIcon(mentor)}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-3">
          <div
            className={`h-full bg-gradient-to-r ${getProgressColor(mentor)} transition-all duration-500`}
            style={{ width: `${mentor}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">{getStatusText(mentor)}</span>
          <span className="text-xs text-slate-500">{isMentorGood ? '✓ On track' : '⚠ Below target'}</span>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`rounded-xl p-4 ${isLectureGood && isMentorGood ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
        <p className={`text-sm font-semibold ${isLectureGood && isMentorGood ? 'text-green-900' : 'text-orange-900'}`}>
          {isLectureGood && isMentorGood ? '✓ Your attendance is on track!' : '⚠ Maintain at least 75% attendance'}
        </p>
      </div>
    </div>
  );
}
