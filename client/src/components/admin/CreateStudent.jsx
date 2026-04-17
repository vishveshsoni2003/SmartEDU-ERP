import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { createStudent, updateStudent } from "../../services/adminApi";
import ImageUpload from "../ui/ImageUpload";
import { Save, User, BookOpen, Home, Bus } from "lucide-react";

const inputCls = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors";
const labelCls = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

const STUDENT_TYPES = [
  { value: "DAY_SCHOLAR", label: "Day Scholar" },
  { value: "HOSTELLER",   label: "Hosteller" },
  { value: "BUS_SERVICE", label: "Bus Service" },
];

export default function CreateStudent({ onCreated, initialData = null }) {
  const isEdit = !!initialData;

  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [buses, setBuses] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "123456",
    enrollmentNo: "",
    rollNo: "",
    studentType: "DAY_SCHOLAR",
    courseId: "",
    year: "",
    semester: "",
    section: "",
    hostelId: "",
    roomNumber: "",
    busId: ""
  });

  // Parallel load of reference data
  useEffect(() => {
    Promise.all([
      api.get("/courses").then(res => setCourses(res.data.courses || [])),
      api.get("/hostels").then(res => setHostels(res.data.hostels || [])),
      api.get("/transport/buses").then(res => setBuses(res.data.buses || []))
    ]).catch(() => toast.error("Failed to load reference data"));
  }, []);

  // Prefill on edit
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.userId?.name || "",
        email: initialData.userId?.email || "",
        password: "",
        enrollmentNo: initialData.enrollmentNo || "",
        rollNo: initialData.rollNo || "",
        studentType: initialData.studentType || "DAY_SCHOLAR",
        courseId: initialData.courseId?._id || initialData.courseId || "",
        year: initialData.year || "",
        semester: initialData.semester || "",
        section: initialData.section || "",
        hostelId: initialData.hostelId?._id || initialData.hostelId || "",
        roomNumber: initialData.roomNumber || "",
        busId: initialData.busId?._id || initialData.busId || ""
      });
    }
  }, [initialData]);

  // Load sections when course+year changes
  useEffect(() => {
    if (form.courseId && form.year) {
      api
        .get(`/sections?courseId=${form.courseId}&year=${form.year}`)
        .then(res => setSections(res.data.sections || []))
        .catch(() => {});
    } else {
      setSections([]);
    }
  }, [form.courseId, form.year]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async () => {
    const { name, email, enrollmentNo, rollNo, studentType, courseId, year, section } = form;
    if (!name || !email || !enrollmentNo || !rollNo || !courseId || !year || !section) {
      return toast.error("Please fill all required academic fields");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] != null && form[key] !== "") formData.append(key, form[key]);
      });
      if (!isEdit && !formData.has("password")) formData.append("password", "123456");
      if (imageFile) formData.append("image", imageFile);

      if (isEdit) {
        await updateStudent(initialData._id, formData);
        toast.success("Student record updated successfully");
      } else {
        await createStudent(formData);
        toast.success("Student enrolled successfully");
      }

      setForm({
        name: "", email: "", password: "123456", enrollmentNo: "", rollNo: "",
        studentType: "DAY_SCHOLAR", courseId: "", year: "", semester: "",
        section: "", hostelId: "", roomNumber: "", busId: ""
      });
      setImageFile(null);
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save student");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          {isEdit ? "Edit Student" : "Enroll New Student"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isEdit ? "Update academic profile and campus integrations." : "Register a new student and assign academic modules."}
        </p>
      </div>

      {/* Profile Image */}
      <ImageUpload onFileSelect={setImageFile} />

      {/* Identity */}
      <div>
        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <User className="h-3.5 w-3.5" /> Identity
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name <span className="text-rose-500">*</span></label>
            <input name="name" value={form.name} placeholder="e.g. John Doe" className={inputCls} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Email Address <span className="text-rose-500">*</span></label>
            <input name="email" type="email" value={form.email} placeholder="john@university.edu" className={inputCls} onChange={handleChange} />
          </div>
          {!isEdit && (
            <div>
              <label className={labelCls}>Password</label>
              <input name="password" type="password" value={form.password} placeholder="Default: 123456" className={inputCls} onChange={handleChange} />
            </div>
          )}
          <div>
            <label className={labelCls}>Enrollment No. <span className="text-rose-500">*</span></label>
            <input name="enrollmentNo" value={form.enrollmentNo} placeholder="e.g. EN2024-001" className={inputCls} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Roll No. <span className="text-rose-500">*</span></label>
            <input name="rollNo" value={form.rollNo} placeholder="e.g. 2024CS01" className={inputCls} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Academic */}
      <div>
        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" /> Academic Details
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Course <span className="text-rose-500">*</span></label>
            <select name="courseId" value={form.courseId} className={inputCls} onChange={handleChange}>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Year <span className="text-rose-500">*</span></label>
              <select name="year" value={form.year} className={inputCls} onChange={handleChange}>
                <option value="">Year</option>
                {[1,2,3,4,5].map(y => <option key={y} value={y}>Y{y}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Semester</label>
              <select name="semester" value={form.semester} className={inputCls} onChange={handleChange}>
                <option value="">Sem</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>S{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Section <span className="text-rose-500">*</span></label>
              <select name="section" value={form.section} className={inputCls} onChange={handleChange} disabled={!form.courseId || !form.year}>
                <option value="">Sec</option>
                {sections.map(s => <option key={s._id} value={s.section}>{s.section}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Type + Conditional */}
      <div>
        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Home className="h-3.5 w-3.5" /> Campus Integration
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Student Type</label>
            <select name="studentType" value={form.studentType} className={inputCls} onChange={handleChange}>
              {STUDENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {form.studentType === "HOSTELLER" && (
            <>
              <div>
                <label className={labelCls}>Hostel</label>
                <select name="hostelId" value={form.hostelId} className={inputCls} onChange={handleChange}>
                  <option value="">Select Hostel</option>
                  {hostels.map(h => <option key={h._id} value={h._id}>{h.name} ({h.type})</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Room No.</label>
                <input name="roomNumber" value={form.roomNumber} placeholder="e.g. A-102" className={inputCls} onChange={handleChange} />
              </div>
            </>
          )}

          {form.studentType === "BUS_SERVICE" && (
            <div>
              <label className={labelCls}>Assigned Bus</label>
              <select name="busId" value={form.busId} className={inputCls} onChange={handleChange}>
                <option value="">Select Bus</option>
                {buses.map(b => (
                  <option key={b._id} value={b._id}>
                    Bus {b.busNumber}{b.routeId ? ` — ${b.routeId.routeName}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          onClick={submit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          {isSubmitting ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Enroll Student"}
        </button>
      </div>
    </div>
  );
}
