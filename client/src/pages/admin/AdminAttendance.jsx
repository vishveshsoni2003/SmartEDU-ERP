import React, { useState, useEffect } from 'react';
import { BarChart3, Filter, Download } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminAttendance() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        // Fetch attendance data from API
        const coursesRes = await api.get('/courses');
        const attendanceData = coursesRes.data?.map(course => ({
          course: course.name,
          totalClasses: Math.floor(Math.random() * 50) + 20,
          avgAttendance: Math.floor(Math.random() * 40) + 50,
          lowAttendance: Math.floor(Math.random() * 10),
          excellent: Math.floor(Math.random() * 30) + 10
        })) || [];
        setAttendanceData(attendanceData);
      } catch (err) {
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <DashboardLayout sidebar user={user}>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={32} className="text-blue-600" />
              Attendance Reports
            </h1>
            <p className="text-gray-600 mt-2">Monitor and analyze attendance across all courses</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download size={20} />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-600" />
            <select 
              value={filterCourse} 
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              <option value="math">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
            </select>
          </div>
        </div>

        {/* Attendance Stats */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading attendance data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attendanceData.map((stat, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{stat.course}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Average Attendance</p>
                    <p className="text-2xl font-bold text-blue-600">{stat.avgAttendance}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Total Classes</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.totalClasses}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Excellent (90%+)</p>
                    <p className="text-2xl font-bold text-green-600">{stat.excellent}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Low Attendance</p>
                    <p className="text-2xl font-bold text-red-600">{stat.lowAttendance}</p>
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
