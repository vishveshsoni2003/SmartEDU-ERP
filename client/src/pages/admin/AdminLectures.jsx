import { useState } from "react";
import { CalendarDays, CalendarPlus, List, Edit } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import CreateLecture from "../../components/admin/CreateLecture";
import LectureList from "../../components/admin/LectureList";

const TAB_CLS = (active) =>
  `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
    active
      ? "bg-white dark:bg-slate-800 shadow-sm text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700"
      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
  }`;

export default function AdminLectures() {
  const [activeTab, setActiveTab] = useState("LIST");
  const [listKey, setListKey] = useState(0);
  const [editLecture, setEditLecture] = useState(null);

  const handleCreated = () => {
    setListKey((k) => k + 1);
    setActiveTab("LIST");
  };

  const handleEdit = (lecture) => {
    setEditLecture(lecture);
    setActiveTab("EDIT");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CalendarDays className="text-blue-600 h-9 w-9" /> Lecture Scheduler
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Assign lectures to faculty, manage timetable slots and schedules.
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-max border border-slate-200 dark:border-slate-800">
          <button onClick={() => setActiveTab("LIST")} className={TAB_CLS(activeTab === "LIST")}>
            <List className="h-4 w-4" /> All Lectures
          </button>
          <button onClick={() => { setActiveTab("CREATE"); setEditLecture(null); }} className={TAB_CLS(activeTab === "CREATE")}>
            <CalendarPlus className="h-4 w-4" /> Schedule Lecture
          </button>
          {editLecture && (
            <button onClick={() => setActiveTab("EDIT")} className={TAB_CLS(activeTab === "EDIT")}>
              <Edit className="h-4 w-4" /> Edit Lecture
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">
          {activeTab === "LIST" && (
            <Card shadow="md" padding="lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Scheduled Lectures</h3>
              <LectureList
                key={listKey}
                refreshKey={listKey}
                onEdit={handleEdit}
              />
            </Card>
          )}

          {activeTab === "CREATE" && (
            <Card shadow="md" padding="lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Schedule New Lecture</h3>
              <CreateLecture onCreated={handleCreated} />
            </Card>
          )}

          {activeTab === "EDIT" && editLecture && (
            <Card shadow="md" padding="lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                Edit Lecture — {editLecture.subjectId?.name}
              </h3>
              <CreateLecture
                initialData={editLecture}
                onCreated={() => {
                  setEditLecture(null);
                  setListKey((k) => k + 1);
                  setActiveTab("LIST");
                }}
              />
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
