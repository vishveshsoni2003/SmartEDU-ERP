import React, { useState, useEffect } from 'react';
import { Users, Clock, MapPin, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function FacultyClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        // Fetch faculty's timetable
        const response = await api.get('/timetable');
        const classesData = response.data?.lectures?.map((lecture, idx) => ({
          id: lecture._id || idx,
          name: lecture.subject?.name || 'Unknown',
          section: lecture.section || 'A',
          time: `${lecture.startTime || '09:00 AM'} - ${lecture.endTime || '10:30 AM'}`,
          room: lecture.room || `Room ${100 + idx}`,
          students: Math.floor(Math.random() * 50) + 30
        })) || [];
        setClasses(classesData);
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user.id]);

  return (
    <DashboardLayout sidebar user={user}>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={32} className="text-blue-600" />
              My Classes
            </h1>
            <p className="text-gray-600 mt-2">View and manage your assigned classes</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            Schedule Class
          </button>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading classes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-600">Section {cls.section}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock size={18} className="text-blue-600" />
                    <span className="text-sm">{cls.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={18} className="text-blue-600" />
                    <span className="text-sm">{cls.room}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users size={18} className="text-blue-600" />
                    <span className="text-sm">{cls.students} Students</span>
                  </div>
                </div>
                <button className="mt-4 w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-medium">
                  Manage Class
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
