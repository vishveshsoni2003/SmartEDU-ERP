import React, { useState } from 'react';
import { Users, UserPlus, Upload, Database } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StudentList from '../../components/admin/StudentList';
import CreateStudent from '../../components/admin/CreateStudent';
import BulkImport from '../../components/admin/BulkImport';

const TAB_CLS = (active) =>
  `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${active
    ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700'
    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
  }`;

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("DIRECTORY");
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="text-blue-600 h-9 w-9" /> Admissions & Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage student enrollments, bulk imports, and database integrity.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-max border border-slate-200 dark:border-slate-800">
          <button onClick={() => setActiveTab("DIRECTORY")} className={TAB_CLS(activeTab === "DIRECTORY")}>
            <Database className="h-4 w-4" /> Directory
          </button>
          <button onClick={() => setActiveTab("CREATE")} className={TAB_CLS(activeTab === "CREATE")}>
            <UserPlus className="h-4 w-4" /> Enroll Student
          </button>
          <button onClick={() => setActiveTab("IMPORT")} className={TAB_CLS(activeTab === "IMPORT")}>
            <Upload className="h-4 w-4" /> Bulk Importer
          </button>
        </div>
        <div className="animate-in fade-in duration-200">
          {activeTab === "DIRECTORY" && <StudentList />}
          {activeTab === "CREATE" && <CreateStudent onCreated={() => setActiveTab("DIRECTORY")} />}
          {activeTab === "IMPORT" && <BulkImport />}
        </div>
      </div>
    </DashboardLayout>
  );
}
