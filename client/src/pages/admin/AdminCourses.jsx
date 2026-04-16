import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Edit2, Trash2, Layers } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import api from '../../services/api';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <BookOpen className="text-blue-600 h-9 w-9" /> Course Registry
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage all academic programs and curriculum</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-blue-600/20">
            <Plus size={18} /> Add Course
          </button>
        </div>

        {/* Search */}
        <Card shadow="sm" padding="md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            />
          </div>
        </Card>

        {/* Courses */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Layers className="w-20 h-20 text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-xl font-bold text-slate-500 dark:text-slate-400">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <Card key={course._id} shadow="md" padding="lg" className="group hover:border-blue-200 dark:hover:border-blue-800 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{course.name}</h3>
                    <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">{course.code || 'N/A'}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Credits</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{course.credits || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Students</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{course.students?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Sections</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{course.sections?.length || 0}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
