import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { createStudent } from "../../services/adminApi";
import ImageUpload from "../ui/ImageUpload";
import { Save } from "lucide-react";

export default function CreateStudent({ onCreated }) {
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

  useEffect(() => {
    // Parallel fetching for performance
    Promise.all([
      api.get("/courses").then(res => setCourses(res.data.courses || [])),
      api.get("/hostels").then(res => setHostels(res.data.hostels || [])),
      api.get("/transport/buses").then(res => setBuses(res.data.buses || []))
    ]).catch(() => toast.error("Failed to load generic metadata"));
  }, []);

  useEffect(() => {
    if (form.courseId && form.year) {
      api
        .get(`/sections?courseId=${form.courseId}&year=${form.year}`)
        .then(res => setSections(res.data.sections || []))
        .catch(() => toast.error("Failed to load sections"));
    }
  }, [form.courseId, form.year]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    const { name, email, enrollmentNo, rollNo, studentType, courseId, year, section } = form;

    if (!name || !email || !enrollmentNo || !rollNo || !courseId || !year || !section) {
      return toast.error("Please fill all mandated academic fields");
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      Object.keys(form).forEach(key => {
        // Only skip null/undefined — keep empty strings and 0 so required fields aren't silently dropped
        if (form[key] != null && form[key] !== "") formData.append(key, form[key]);
      });
      // Ensure password always included (default value even if field is hidden)
      if (!formData.has("password")) formData.append("password", "123456");

      // Map to exact multer upload field name 'image'
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await createStudent(formData);
      toast.success("Student successfully enrolled!");

      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create student context");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Enroll New Student</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure core identifiers and allocate campus modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

        {/* Full-width Image Uploader */}
        <div className="md:col-span-2 mb-2">
          <ImageUpload onFileSelect={setImageFile} />
        </div>

        {/* BASIC IDENTIFIERS */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input name="name" placeholder="E.g., John Doe" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input name="email" type="email" placeholder="john@university.edu" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Enrollment Number</label>
          <input name="enrollmentNo" placeholder="E.g., EN2024-001" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Roll / Identifier No.</label>
          <input name="rollNo" placeholder="E.g., 2024CS01" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" onChange={handleChange} />
        </div>

        {/* ACADEMIC MAPPING */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Course</label>
          <select name="courseId" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" onChange={handleChange}>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
            <select name="year" className="w-full border dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-white" onChange={handleChange}>
              <option value="">Year</option>
              {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester</label>
            <select name="semester" className="w-full border dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-white" onChange={handleChange}>
              <option value="">Sem</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
            <select name="section" className="w-full border dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 dark:text-white" onChange={handleChange} disabled={!form.courseId || !form.year}>
              <option value="">Section</option>
              {sections.map(s => <option key={s._id} value={s.section}>{s.section}</option>)}
            </select>
          </div>
        </div>

        {/* CAMPUS MODULES */}
        <div className="md:col-span-2 pt-4 border-t mt-2">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Campus Integrations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student Classification</label>
              <select name="studentType" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" onChange={handleChange}>
                <option value="DAY_SCHOLAR">Day Scholar</option>
                <option value="HOSTELLER">Hosteller</option>
                <option value="BUS_SERVICE">Bus Service</option>
              </select>
            </div>

            {form.studentType === "HOSTELLER" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hostel Block</label>
                  <select name="hostelId" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" onChange={handleChange}>
                    <option value="">Select Hostel</option>
                    {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room No.</label>
                  <input name="roomNumber" placeholder="E.g., A-102" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" onChange={handleChange} />
                </div>
              </div>
            )}

            {form.studentType === "BUS_SERVICE" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Route/Bus</label>
                <select name="busId" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" onChange={handleChange}>
                  <option value="">Select Transport</option>
                  {buses.map(b => <option key={b._id} value={b._id}>Bus: {b.busNumber} {b.routeId ? `(${b.routeId.routeName})` : ''}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={submit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? "Enrolling..." : "Enroll Student"}
        </button>
      </div>
    </div>
  );
}
