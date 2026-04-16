import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Key } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const INPUT_CLS = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition";
const LABEL_CLS = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2";
const TAB_CLS = (active) => `flex-1 px-6 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${active ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/30 dark:bg-blue-900/10' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
  }`;

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    classReminders: true,
    attendanceAlerts: true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await api.patch('/users/profile', { name: formData.name, phone: formData.phone });
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile.');
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) return toast.error('Passwords do not match.');
    if (formData.newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    try {
      await api.patch('/users/change-password', { currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      toast.success('Password changed successfully.');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const NOTIFICATION_LABELS = {
    emailNotifications: 'Email Notifications',
    smsNotifications: 'SMS Notifications',
    classReminders: 'Class Reminders',
    attendanceAlerts: 'Attendance Alerts',
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <SettingsIcon className="text-blue-600 h-9 w-9" /> Node Parameters
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your account identity and security credentials.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={TAB_CLS(activeTab === tab.id)}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className={LABEL_CLS}>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={INPUT_CLS} placeholder="Your full name" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Email Address</label>
                  <input type="email" name="email" value={formData.email} className={INPUT_CLS + " opacity-60 cursor-not-allowed"} disabled />
                  <p className="text-xs text-slate-400 mt-1.5">Email cannot be changed. Contact Super Admin.</p>
                </div>
                <div>
                  <label className={LABEL_CLS}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={INPUT_CLS} placeholder="+91 XXXXXXXXXX" />
                </div>
                <button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-600/20">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <label className={LABEL_CLS + " flex items-center gap-1.5"}><Key size={14} /> Current Password</label>
                  <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} className={INPUT_CLS} placeholder="••••••••" />
                </div>
                <div>
                  <label className={LABEL_CLS}>New Password</label>
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className={INPUT_CLS} placeholder="Min. 6 characters" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={INPUT_CLS} placeholder="Repeat new password" />
                </div>
                <button onClick={handleChangePassword} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-rose-600/20">
                  Change Password
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{NOTIFICATION_LABELS[key]}</p>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition mt-4 shadow-lg shadow-blue-600/20">
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
