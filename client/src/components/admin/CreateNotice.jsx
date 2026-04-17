import { useState, useRef, useEffect } from "react";
import { UploadCloud, X, Calendar, Megaphone, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function CreateNotice({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetAudience: "ALL",
    expiresAt: "",
    // Advanced targets
    courseId: "",
    hostelId: "",
    busId: ""
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Lookups
  const [courses, setCourses] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/courses").then(res => setCourses(res.data.courses || [])),
      api.get("/hostels").then(res => setHostels(res.data.hostels || [])),
      api.get("/transport/buses").then(res => setBuses(res.data.buses || []))
    ]).catch(() => console.error("Failed to load targets"));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.size > 10 * 1024 * 1024) return toast.error("Attachment exceeds 10MB limit");
    setFile(f);
  };

  const submit = async () => {
    if (!form.title || !form.message) {
      return toast.error("Title and Message are strictly required.");
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key]) formData.append(key, form[key]);
      });
      if (file) formData.append("attachment", file); // attachment specific to notice backend

      await api.post("/notices", formData);
      toast.success("Notice broadcasted successfully!");
      if (onCreated) onCreated();
      setForm({ title: "", message: "", targetAudience: "ALL", expiresAt: "", courseId: "", hostelId: "", busId: "" });
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to broadcast notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <Megaphone className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Broadcast Notice</h3>
          <p className="text-sm text-slate-500">Deliver targeted alerts mapped securely across student arrays.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">Headline</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="E.g., Mid-term Examination Schedule" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">Detailed Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} placeholder="Notice content..." rows="4" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">Target Dimension</label>
            <select name="targetAudience" value={form.targetAudience} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors">
              <option value="ALL">Entire Institution</option>
              <option value="STUDENT">All Students</option>
              <option value="FACULTY">All Faculty</option>
              <option value="SPECIFIC">Granular Segregation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">Expiration / Auto-Archive Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} className="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors" />
            </div>
          </div>
        </div>

        {/* Dynamic Target Selectors */}
        {form.targetAudience === "SPECIFIC" && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Target Course</label>
              <select name="courseId" value={form.courseId} onChange={handleChange} className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors">
                <option value="">Any Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Target Hostel</label>
              <select name="hostelId" value={form.hostelId} onChange={handleChange} className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors">
                <option value="">Any Hostel</option>
                {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Target Bus Route</label>
              <select name="busId" value={form.busId} onChange={handleChange} className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors">
                <option value="">Any Bus</option>
                {buses.map(b => <option key={b._id} value={b._id}>Bus: {b.busNumber}</option>)}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 tracking-wide">Optional Attachment (Image/PDF)</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition text-sm font-medium text-slate-700 dark:text-slate-300">
              <UploadCloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {file ? "Change File" : "Upload File"}
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
            </label>
            {file && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg text-sm border border-blue-100 dark:border-blue-500/20">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => setFile(null)} className="hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 shadow-lg shadow-blue-600/20 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all w-full md:w-auto justify-center"
          >
            {isSubmitting ? <div className="h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
            {isSubmitting ? "Transmitting..." : "Broadcast Notice"}
          </button>
        </div>
      </div>
    </div>
  );
}
