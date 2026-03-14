import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit2, Trash2, UserCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Fetch all students
        const studentsRes = await api.get('/students');
        const students = studentsRes.data?.map(student => ({
          id: student._id,
          name: student.name,
          email: student.email,
          role: 'STUDENT',
          status: student.status || 'Active'
        })) || [];
        
        // Fetch all faculty
        const facultyRes = await api.get('/faculty');
        const faculty = facultyRes.data?.map(f => ({
          id: f._id,
          name: f.name,
          email: f.email,
          role: 'FACULTY',
          status: f.status || 'Active'
        })) || [];
        
        setUsers([...students, ...faculty]);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout sidebar user={user}>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={32} className="text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all users in the system</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading users...</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <UserCheck size={14} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
