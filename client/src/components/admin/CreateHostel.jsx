import { useState } from "react";
import toast from "react-hot-toast";
import { createHostel } from "../../services/adminApi";

export default function CreateHostel({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    type: "BOYS",
    totalRooms: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.totalRooms) {
      return toast.error("Please fill all required hostel parameters");
    }
    try {
      await createHostel(form);
      toast.success("Hostel facility instantiated successfully");
      setForm({ name: "", type: "BOYS", totalRooms: "" });
      if (onCreated) onCreated();
    } catch (err) {
      toast.error("Failed to initialize hostel");
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <input
        name="name"
        placeholder="Hostel Name (e.g. Block A)"
        value={form.name}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
      />

      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
      >
        <option value="BOYS">Boys Wing</option>
        <option value="GIRLS">Girls Wing</option>
      </select>

      <input
        name="totalRooms"
        placeholder="Total Rooms Available"
        type="number"
        value={form.totalRooms}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
      >
        Deploy Hostel Wing
      </button>
    </form>
  );
}
