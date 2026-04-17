import { useState } from "react";
import toast from "react-hot-toast";
import { Send, Megaphone } from "lucide-react";
import api from "../../services/api";

export default function CreateNotice({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetAudience: "STUDENT"
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.title || !form.message) {
      return toast.error("Title and message are required");
    }

    setSubmitting(true);
    try {
      await api.post("/notices", form);
      toast.success("Notice published successfully");
      setForm({ title: "", message: "", targetAudience: "STUDENT" });
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish notice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        placeholder="Notice Title"
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        placeholder="Notice message..."
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors resize-none"
        rows={4}
        value={form.message}
        onChange={e => setForm({ ...form, message: e.target.value })}
      />

      <select
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
        value={form.targetAudience}
        onChange={e => setForm({ ...form, targetAudience: e.target.value })}
      >
        <option value="FACULTY">Faculty</option>
        <option value="STUDENT">Students</option>
        <option value="ALL">All</option>
      </select>

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
      >
        {submitting ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {submitting ? "Publishing..." : "Publish Notice"}
      </button>
    </div>
  );
}
