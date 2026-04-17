import { useEffect, useState, useCallback } from "react";
import { Search, UserCircle, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { deleteStudent } from "../../services/adminApi";
import Pagination from "../ui/Pagination";
import Skeleton, { SkeletonRow } from "../ui/Skeleton";

export default function StudentList({ onEdit }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Server-Side Navigation State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  // Additional Dropdown API State
  const [courses, setCourses] = useState([]);

  // Active Filters
  const [filters, setFilters] = useState({
    courseId: "",
    year: "",
    section: ""
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        ...(filters.courseId && { courseId: filters.courseId }),
        ...(filters.year && { year: filters.year }),
        ...(filters.section && { section: filters.section })
      });

      const res = await api.get(`/students?${queryParams}`);
      setStudents(res.data.students || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      toast.error("Failed to fetch students");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters, limit]);

  useEffect(() => {
    // Fetch courses strictly once for the dropdown
    api.get("/courses").then(res => setCourses(res.data.courses || [])).catch(() => { });
  }, []);

  useEffect(() => {
    // Hook triggers on debounced search changes, page turns, or filter adjustments
    const timeoutId = setTimeout(() => {
      fetchStudents();
    }, 300); // 300ms debounce on search
    return () => clearTimeout(timeoutId);
  }, [fetchStudents]);

  const handleDelete = (id, name) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-slate-900 tracking-tight">Expel "{name}"?</p>
        <p className="text-sm text-slate-500 font-medium">This will permanently dismantle their student record and unpair all associated modules.</p>
        <div className="flex gap-2 justify-end mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await deleteStudent(id);
              setStudents((prev) => prev.filter(s => s._id !== id));
              toast.success("Student successfully expelled from system!");
            } catch (err) {
              toast.error(err.response?.data?.message || "Failed to process expulsion");
            }
          }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-600/20 transition-all">Execute Expulsion</button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  return (
    <div className="space-y-4">
      {/* FILTER PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, roll, enrollment..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          value={filters.courseId}
          onChange={(e) => { setFilters({ ...filters, courseId: e.target.value }); setPage(1); }}
        >
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select
          className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          value={filters.year}
          onChange={(e) => { setFilters({ ...filters, year: e.target.value }); setPage(1); }}
        >
          <option value="">All Years</option>
          {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
        <select
          className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          value={filters.section}
          onChange={(e) => { setFilters({ ...filters, section: e.target.value }); setPage(1); }}
        >
          <option value="">All Sections</option>
          {["A","B","C","D"].map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Student</th>
              <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Identifiers</th>
              <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Course</th>
              <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Type</th>
              <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {[1,2,3,4,5].map(j => (
                    <td key={j} className="py-3 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <UserCircle className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="font-medium">No students match your criteria.</p>
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {s.profileImage?.url ? (
                        <img src={s.profileImage.url} alt="" className="h-9 w-9 rounded-full object-cover bg-slate-200 dark:bg-slate-700" />
                      ) : (
                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                          <UserCircle className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{s.userId?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{s.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">{s.enrollmentNo}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Roll: {s.rollNo}</p>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {s.courseId ? (
                      <>
                        <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full">
                          {s.courseId.name}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Y{s.year} · Sec {s.section}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      s.studentType === "HOSTELLER"   ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400" :
                      s.studentType === "BUS_SERVICE" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                                                        "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      {s.studentType === "DAY_SCHOLAR" ? "Day Scholar" :
                       s.studentType === "HOSTELLER"   ? "Hosteller"   : "Bus Service"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit && onEdit(s)} className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(s._id, s.userId?.name)} className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
