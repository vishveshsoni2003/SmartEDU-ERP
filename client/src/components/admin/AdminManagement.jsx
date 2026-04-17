import { useEffect, useState } from "react";
import {
  getInstitutionAdmins,
  createInstitutionAdmin,
  toggleAdminStatus
} from "../../services/adminApi";
import toast from "react-hot-toast";
import { ShieldCheck, ShieldOff } from "lucide-react";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [toggling, setToggling] = useState(null);

  const load = async () => {
    try {
      const data = await getInstitutionAdmins();
      setAdmins(data.admins || []);
    } catch {
      toast.error("Failed to load admins");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      return toast.error("All fields are required");
    }
    try {
      await createInstitutionAdmin(form);
      toast.success("Admin created successfully");
      setForm({ name: "", email: "", password: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create Admin");
    }
  };

  const handleToggle = async (admin) => {
    setToggling(admin._id);
    try {
      const res = await toggleAdminStatus(admin._id);
      toast.success(res.message);
      setAdmins((prev) =>
        prev.map((a) =>
          a._id === admin._id ? { ...a, isActive: res.isActive } : a
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mt-10 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Manage Institution Admins
      </h3>

      {/* CREATE ADMIN */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Name"
          className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 p-2.5 rounded-xl flex-1 min-w-[140px] outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 p-2.5 rounded-xl flex-1 min-w-[160px] outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 p-2.5 rounded-xl flex-1 min-w-[140px] outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          onClick={submit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
        >
          Add Admin
        </button>
      </div>

      {/* LIST ADMINS */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr className="text-left text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                  No admins found.
                </td>
              </tr>
            ) : (
              admins.map((a) => (
                <tr
                  key={a._id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {a.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{a.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">
                      {a.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        a.isActive !== false
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                          : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {a.isActive !== false ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggle(a)}
                      disabled={toggling === a._id}
                      title={a.isActive !== false ? "Deactivate admin" : "Activate admin"}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        a.isActive !== false
                          ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                          : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                      }`}
                    >
                      {a.isActive !== false ? (
                        <ShieldOff className="h-4 w-4" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                    </button>
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
