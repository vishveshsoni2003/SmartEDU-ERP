import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function CreateHoliday({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    type: "HOLIDAY"
  });

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.title || !form.date) {
      return toast.error("Title and chronological date are strictly required");
    }

    try {
      await api.post("/holidays", form);
      toast.success("Institutional holiday mapped successfully!");
      setForm({ title: "", date: "", type: "HOLIDAY" });
      onCreated && onCreated();
    } catch (err) {
      toast.error("Failed to map holiday to calendar");
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <input
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        placeholder="Holiday Title (e.g. Winter Break)"
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        <select
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
        >
          <option value="HOLIDAY">Single Holiday</option>
          <option value="VACATION">Extended Vacation</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
      >
        Sync to Calendar Map
      </button>
    </form>
  );
}
