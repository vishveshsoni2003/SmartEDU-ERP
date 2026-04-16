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
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <Megaphone className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Broadcast Notice</h3>
          <p className="text-sm text-slate-500">Deliver targeted alerts mapped securely across student arrays.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="E.g., Mid-term Examination Schedule" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} placeholder="Notice content..." rows="4" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Dimension</label>
            <select name="targetAudience" value={form.targetAudience} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
              <option value="ALL">Entire Institution</option>
              <option value="STUDENT">All Students</option>
              <option value="FACULTY">All Faculty</option>
              <option value="SPECIFIC">Granular Segregation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiration / Auto-Archive Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} className="w-full border rounded-lg py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
        </div>

        {/* Dynamic Target Selectors */}
        {form.targetAudience === "SPECIFIC" && (
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Target Course</label>
              <select name="courseId" value={form.courseId} onChange={handleChange} className="w-full border rounded p-2 text-sm bg-white">
                <option value="">Any</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Target Hostel</label>
              <select name="hostelId" value={form.hostelId} onChange={handleChange} className="w-full border rounded p-2 text-sm bg-white">
                <option value="">Any</option>
                {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Target Bus Route</label>
              <select name="busId" value={form.busId} onChange={handleChange} className="w-full border rounded p-2 text-sm bg-white">
                <option value="">Any</option>
                {buses.map(b => <option key={b._id} value={b._id}>Bus: {b.busNumber}</option>)}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Optional Attachment (Image/PDF)</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition text-sm font-medium text-slate-700">
              <UploadCloud className="h-4 w-4 text-blue-600" />
              {file ? "Change File" : "Upload File"}
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
            </label>
            {file && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm border border-blue-100">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => setFile(null)} className="hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t mt-4">
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
            {isSubmitting ? "Transmitting..." : "Broadcast Notice"}
          </button>
        </div>
      </div>
    </div>
  );
}
