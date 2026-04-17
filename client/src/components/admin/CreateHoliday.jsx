import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CalendarPlus, Save } from "lucide-react";
import api from "../../services/api";

const HOLIDAY_TYPES = [
  { value: "HOLIDAY", label: "Public Holiday" },
  { value: "VACATION", label: "Vacation / Break" },
];

const EMPTY = { title: "", date: "", type: "HOLIDAY", description: "" };

export default function CreateHoliday({ onCreated, initialData = null }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        date: initialData.date?.slice(0, 10) || "",
        type: initialData.type || "HOLIDAY",
        description: initialData.description || "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [initialData]);

  const inputCls =
    "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors";

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) return toast.error("Holiday title is required");
    if (!form.date) return toast.error("Date is required");

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/holidays/${initialData._id}`, form);
        toast.success("Holiday updated successfully");
      } else {
        await api.post("/holidays", form);
        toast.success("Holiday added to calendar");
        setForm(EMPTY);
      }
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save holiday");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4 max-w-lg" onSubmit={submit}>
      <input
        className={inputCls}
        placeholder="Holiday title (e.g. Diwali, Winter Break)"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          className={inputCls}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <select
          className={inputCls}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {HOLIDAY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        className={`${inputCls} resize-none`}
        rows={2}
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
      >
        {submitting ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isEdit ? (
          <Save className="h-4 w-4" />
        ) : (
          <CalendarPlus className="h-4 w-4" />
        )}
        {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Holiday"}
      </button>
    </form>
  );
}
