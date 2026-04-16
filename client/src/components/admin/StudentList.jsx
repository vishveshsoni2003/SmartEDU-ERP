import { useEffect, useState, useCallback } from "react";
import { Search, UserCircle, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import Pagination from "../ui/Pagination";
import Skeleton, { SkeletonRow } from "../ui/Skeleton";

export default function StudentList() {
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800">Student Directory</h3>
        <p className="text-sm text-slate-500">Manage institution enrollments natively via server-side hooks.</p>
      </div>

      {/* FILTER PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search roll/name..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset exact bounds on new search
            }}
          />
        </div>

        <select
          className="border p-2 rounded-lg text-sm bg-slate-50 focus:bg-white"
          value={filters.courseId}
          onChange={(e) => { setFilters({ ...filters, courseId: e.target.value }); setPage(1); }}
        >
          <option value="">All Courses</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded-lg text-sm bg-slate-50 focus:bg-white"
          value={filters.year}
          onChange={(e) => { setFilters({ ...filters, year: e.target.value }); setPage(1); }}
        >
          <option value="">All Years</option>
          {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>

        <select
          className="border p-2 rounded-lg text-sm bg-slate-50 focus:bg-white"
          value={filters.section}
          onChange={(e) => { setFilters({ ...filters, section: e.target.value }); setPage(1); }}
        >
          <option value="">All Sections</option>
          {["A", "B", "C"].map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* REACTIVE DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-y">
            <tr>
              <th className="py-3 px-4 font-semibold">Student</th>
              <th className="py-3 px-4 font-semibold">Identifiers</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Course Details</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <>
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
              </>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">
                  <UserCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <p>No students match your exact search criteria.</p>
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {s.profileImage?.url ? (
                        <img src={s.profileImage.url} alt="" className="h-10 w-10 rounded-full object-cover shadow-sm bg-slate-200" />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <UserCircle className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{s.userId?.name}</p>
                        <p className="text-xs text-slate-500">{s.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{s.enrollmentNo}</span>
                      <span className="text-xs text-slate-500">Roll: {s.rollNo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {s.courseId?.name || "Unassigned"}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Year {s.year} - {s.section}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 rounded transition" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded transition" title="Delete">
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

      {/* PAGINATION ANCHOR */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
