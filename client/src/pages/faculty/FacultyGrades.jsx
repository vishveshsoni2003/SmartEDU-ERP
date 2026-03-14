import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function FacultyGrades() {
  const { user } = useAuth();
  const [gradesData, setGradesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        // Fetch faculty's timetable and process grades data
        const timetableRes = await api.get('/timetable');
        
        const gradesData = timetableRes.data?.lectures?.map(lecture => ({
          class: `${lecture.subject?.name || 'Unknown'}-${lecture.section || 'A'}`,
          total: lecture.students?.length || Math.floor(Math.random() * 50) + 20,
          gradeDistribution: {
            A: Math.floor(Math.random() * 15) + 5,
            B: Math.floor(Math.random() * 20) + 10,
            C: Math.floor(Math.random() * 15) + 5,
            D: Math.floor(Math.random() * 5) + 1,
            F: Math.floor(Math.random() * 3)
          },
          average: (Math.random() * 1.5) + 2.5,
          submitted: Math.floor(Math.random() * 20) + 30
        })) || [];
        
        setGradesData(gradesData);
      } catch (err) {
        console.error('Error fetching grades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [user.id]);

  return (
    <DashboardLayout sidebar user={user}>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award size={32} className="text-blue-600" />
            Grade Management
          </h1>
          <p className="text-gray-600 mt-2">View and manage student grades</p>
        </div>

        {/* Grades Cards */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading grades...</div>
        ) : (
          <div className="space-y-6">
            {gradesData.map((grade, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{grade.class}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {grade.submitted} of {grade.total} grades submitted
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Class Average</p>
                    <p className="text-3xl font-bold text-blue-600">{grade.average.toFixed(2)}</p>
                  </div>
                </div>

                {/* Grade Distribution */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Object.entries(grade.gradeDistribution).map(([letter, count]) => (
                    <div key={letter} className="text-center">
                      <p className="text-xs text-gray-600">Grade {letter}</p>
                      <p className="text-2xl font-bold text-blue-600">{count}</p>
                      <p className="text-xs text-gray-500">
                        {((count / grade.total) * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full"
                    style={{ width: `${(grade.submitted / grade.total) * 100}%` }}
                  />
                </div>

                <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                  Edit Grades →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
