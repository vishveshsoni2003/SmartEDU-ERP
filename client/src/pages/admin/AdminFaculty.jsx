import React, { useState } from 'react';
import { GraduationCap, UserPlus, Database, Edit } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import CreateFaculty from '../../components/admin/CreateFaculty';
import FacultyList from '../../components/admin/FacultyList';

const TAB_CLS = (active) =>
  `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
    active
      ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
  }`;

export default function AdminFaculty() {
  const [activeTab, setActiveTab] = useState("DIRECTORY");
  const [editFaculty, setEditFaculty] = useState(null);
  const [listKey, setListKey] = useState(0);

  const handleCreatedOrUpdated = () => {
    setActiveTab("DIRECTORY");
    setEditFaculty(null);
    setListKey((k) => k + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="text-blue-600 h-9 w-9" /> Faculty Roster
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage academic staff, profiles, and department coordination.
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-max border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setActiveTab("DIRECTORY"); setEditFaculty(null); }}
            className={TAB_CLS(activeTab === "DIRECTORY")}
          >
            <Database className="h-4 w-4" /> Directory
          </button>
          <button
            onClick={() => { setActiveTab("CREATE"); setEditFaculty(null); }}
            className={TAB_CLS(activeTab === "CREATE")}
          >
            <UserPlus className="h-4 w-4" /> Onboard Faculty
          </button>
          {editFaculty && (
            <button
              onClick={() => setActiveTab("EDIT")}
              className={TAB_CLS(activeTab === "EDIT")}
            >
              <Edit className="h-4 w-4" /> Edit Faculty
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">
          {activeTab === "DIRECTORY" && (
            <Card shadow="md" padding="lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Active Directory</h3>
              <FacultyList
                key={listKey}
                onEdit={(f) => {
                  setEditFaculty(f);
                  setActiveTab("EDIT");
                }}
              />
            </Card>
          )}

          {activeTab === "CREATE" && (
            <Card shadow="md" padding="lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Onboard Educator</h3>
              <CreateFaculty onCreated={handleCreatedOrUpdated} />
            </Card>
          )}

          {activeTab === "EDIT" && editFaculty && (
            <Card shadow="md" padding="lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                Edit — {editFaculty.userId?.name}
              </h3>
              <CreateFaculty
                initialData={editFaculty}
                onCreated={handleCreatedOrUpdated}
              />
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
