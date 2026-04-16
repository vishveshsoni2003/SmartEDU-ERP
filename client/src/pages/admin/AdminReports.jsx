import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Download, TrendingUp, Users, BookOpen, GraduationCap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import api from '../../services/api';

const REPORT_TYPES = ['All', 'Performance', 'Attendance', 'Financial', 'Enrollment'];

export default function AdminReports() {
  const [reportType, setReportType] = useState('All');
  const [stats, setStats] = useState({ courses: 0, students: 0, faculty: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/courses'),
      api.get('/students'),
      api.get('/faculty'),
    ]).then(([c, s, f]) => {
      setStats({
        courses: c.value?.data?.length || 0,
        students: s.value?.data?.students?.length || s.value?.data?.length || 0,
        faculty: f.value?.data?.length || 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const reports = [
    { title: 'Monthly Enrollment Summary', description: 'Complete enrollment breakdown across all departments and semesters', date: 'Apr 2026', size: '2.3 MB', type: 'Enrollment' },
    { title: 'Semester Attendance Report', description: 'Attendance analytics per faculty, subject, and section groupings', date: 'Apr 2026', size: '4.1 MB', type: 'Attendance' },
    { title: 'Faculty Performance Matrix', description: 'Evaluations and lecture delivery scores for all teaching staff', date: 'Mar 2026', size: '1.8 MB', type: 'Performance' },
    { title: 'Fee Collection Summary', description: 'Revenue collected vs pending across hostels, bus, tuition fees', date: 'Mar 2026', size: '0.9 MB', type: 'Financial' },
  ].filter(r => reportType === 'All' || r.type === reportType);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="text-blue-600 h-9 w-9" /> Reports & Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">View, filter, and download institutional reports</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Total Courses" value={stats.courses} icon={BookOpen} delay={0.1} />
            <StatCard title="Enrolled Students" value={stats.students} icon={Users} delay={0.2} />
            <StatCard title="Faculty Members" value={stats.faculty} icon={GraduationCap} delay={0.3} />
          </div>
        )}

        {/* Filter */}
        <Card shadow="sm" padding="md">
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map(t => (
              <button key={t} onClick={() => setReportType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${reportType === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                {t}
              </button>
            ))}
          </div>
        </Card>

        {/* Reports */}
        <div className="space-y-4">
          {reports.map((report, i) => (
            <Card key={i} shadow="md" padding="lg" className="group hover:border-blue-200 dark:hover:border-blue-800 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="text-blue-600 dark:text-blue-400" size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{report.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{report.description}</p>
                    <div className="flex gap-4 text-xs font-bold text-slate-400 mt-2">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {report.date}</span>
                      <span>{report.size}</span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{report.type}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition shrink-0 shadow-lg shadow-blue-600/20">
                  <Download size={16} /> Download
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
