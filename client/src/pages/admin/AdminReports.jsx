import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Download, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminReports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('all');
  const [reportStats, setReportStats] = useState({
    totalReports: 12,
    thisMonth: 4,
    totalSize: '8.5 GB'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        // Fetch various data to generate report stats
        const coursesRes = await api.get('/courses');
        const studentsRes = await api.get('/students');
        const facultyRes = await api.get('/faculty');
        
        // Calculate stats based on actual data
        const totalCourses = coursesRes.data?.length || 0;
        const totalStudents = studentsRes.data?.length || 0;
        const totalFaculty = facultyRes.data?.length || 0;
        
        setReportStats({
          totalReports: 12,
          thisMonth: 4,
          totalSize: '8.5 GB',
          courses: totalCourses,
          students: totalStudents,
          faculty: totalFaculty
        });
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  return (
    <DashboardLayout sidebar user={user}>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={32} className="text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2">View and download system reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
            <p className="text-sm text-gray-600">Total Reports</p>
            <p className="text-3xl font-bold text-blue-600">{reportStats.totalReports}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-3xl font-bold text-green-600">{reportStats.thisMonth}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
            <p className="text-sm text-gray-600">Total Size</p>
            <p className="text-3xl font-bold text-purple-600">{reportStats.totalSize}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reports</option>
            <option value="performance">Performance</option>
            <option value="attendance">Attendance</option>
            <option value="financial">Financial</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-3">{report.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {report.date}
                    </span>
                    <span>{report.size}</span>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap">
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
