import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { createFaculty, updateFaculty } from "../../services/adminApi";

const FACULTY_ROLES = [
  { label: "Lecturer", value: "LECTURER" },
  { label: "Hostel Warden", value: "WARDEN" },
  { label: "Club Incharge", value: "CLUB_INCHARGE" },
  { label: "Transport Manager", value: "TRANSPORT_MANAGER" }
];

export default function CreateFaculty({ onCreated, initialData = null }) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "123456",
    employeeId: "",
    facultyType: ["LECTURER"]
  });

  // Prefill form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.userId?.name || "",
        email: initialData.userId?.email || "",
        password: "", // Don't overwrite password on edit unless provided
        employeeId: initialData.employeeId || "",
        facultyType: initialData.facultyType || ["LECTURER"]
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleRole = (role) => {
    setForm((prev) => {
      const exists = prev.facultyType.includes(role);
      return {
        ...prev,
        facultyType: exists
          ? prev.facultyType.filter(r => r !== role)
          : [...prev.facultyType, role]
      };
    });
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.employeeId) {
      return toast.error("All required personnel fields must be filled");
    }

    try {
      if (isEdit) {
        // On edit, only send password if the admin typed a new one
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await updateFaculty(initialData._id, payload);
        toast.success("Faculty profile updated successfully!");
      } else {
        await createFaculty(form);
        toast.success("Faculty profile deployed successfully!");
        setForm({ name: "", email: "", password: "123456", employeeId: "", facultyType: ["LECTURER"] });
      }
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save faculty profile");
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          placeholder="Faculty Name (e.g. Dr. Jane Smith)"
          onChange={handleChange}
          value={form.name}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        />

        <input
          name="email"
          placeholder="Institutional Email"
          onChange={handleChange}
          value={form.email}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        />
      </div>

      <input
        name="employeeId"
        placeholder="Employee ID Token (e.g. FAC-2041)"
        onChange={handleChange}
        value={form.employeeId}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
      />

      {/* FACULTY ROLES */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
          Assigned Roles Matrix
        </p>

        <div className="grid grid-cols-2 gap-3">
          {FACULTY_ROLES.map((role) => (
            <label
              key={role.value}
              className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer group"
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={form.facultyType.includes(role.value)}
                  onChange={() => toggleRole(role.value)}
                  className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900 checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
                />
              </div>
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{role.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
      >
        {isEdit ? "Save Changes" : "Initialize Faculty Profile"}
      </button>
    </form>
  );
}
