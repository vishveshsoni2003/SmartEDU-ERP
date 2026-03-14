import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fetch courses from API
        const response = await api.get('/courses');
        const coursesData = response.data?.map(course => ({
          id: course._id,
          name: course.name,
          code: course.code || 'N/A',
          credits: course.credits || 0,
          instructor: course.instructor?.name || 'Unassigned',
          students: course.students?.length || 0
        })) || [];
        setCourses(coursesData);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout sidebar user={user}>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={32} className="text-blue-600" />
              Course Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all courses and curriculum</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            Add Course
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Credits</p>
                    <p className="text-xl font-bold text-gray-900">{course.credits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="text-xl font-bold text-gray-900">{course.students}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Instructor</p>
                    <p className="text-sm font-medium text-gray-900">{course.instructor.split(' ')[1]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
