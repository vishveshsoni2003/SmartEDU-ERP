import { useEffect, useState, useCallback } from "react";
import { Edit, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getAllFaculty, deleteFaculty } from "../../services/adminApi";
import Skeleton, { SkeletonRow } from "../ui/Skeleton";

export default function FacultyList({ onEdit }) {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllFaculty();
      setFaculty(data.faculty || []);
    } catch {
      toast.error("Failed to fetch faculty");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const handleDelete = (f) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-bold text-slate-900 dark:text-white">
            Remove {f.userId?.name}?
          </p>
          <p className="text-sm text-slate-500">
            This will permanently delete the faculty profile and login access.
          </p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setDeleting(f._id);
                try {
                  await deleteFaculty(f._id);
                  setFaculty((prev) => prev.filter((x) => x._id !== f._id));
                  toast.success("Faculty removed successfully");
                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Failed to remove faculty"
                  );
                } finally {
                  setDeleting(null);
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-600/20 transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  const filtered = faculty.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.userId?.name?.toLowerCase().includes(q) ||
      f.userId?.email?.toLowerCase().includes(q) ||
      f.employeeId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or employee ID..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr className="text-left text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Employee ID</th>
              <th className="py-3 px-4 font-semibold">Roles</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="py-3 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-slate-400 dark:text-slate-500 font-medium"
                >
                  {search ? "No faculty match your search." : "No faculty found."}
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr
                  key={f._id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {f.userId?.name || "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {f.userId?.email || "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {f.employeeId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(f.facultyType || []).map((role) => (
                        <span
                          key={role}
                          className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(f)}
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors"
                          title="Edit faculty"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(f)}
                        disabled={deleting === f._id}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 disabled:opacity-50 transition-colors"
                        title="Delete faculty"
                      >
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
    </div>
  );
}
