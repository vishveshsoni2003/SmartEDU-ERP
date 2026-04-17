import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarPlus, Save } from "lucide-react";
import api from "../../services/api";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const LECTURE_TYPES = [
  { value: "THEORY", label: "Theory" },
  { value: "PRACTICAL", label: "Practical" },
  { value: "TUTORIAL", label: "Tutorial" },
  { value: "LAB", label: "Lab" },
];

const EMPTY_FORM = {
  courseId: "",
  subjectId: "",
  facultyId: "",
  year: "",
  section: "",
  day: "",
  startTime: "",
  endTime: "",
  lectureType: "THEORY",
  room: "",
};

export default function CreateLecture({ onCreated, initialData = null }) {
  const isEdit = !!initialData;

  const [form, setForm] = useState(EMPTY_FORM);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Load static dropdown data once
  useEffect(() => {
    api.get("/courses").then((res) => setCourses(res.data.courses || [])).catch(() => {});
    api.get("/subjects").then((res) => setSubjects(res.data.subjects || [])).catch(() => {});
    api.get("/faculty").then((res) => setFaculty(res.data.faculty || [])).catch(() => {});
    api.get("/sections").then((res) => setAllSections(res.data.sections || [])).catch(() => {});
  }, []);

  // Prefill form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        courseId: initialData.courseId?._id || initialData.courseId || "",
        subjectId: initialData.subjectId?._id || initialData.subjectId || "",
        facultyId: initialData.facultyId?._id || initialData.facultyId || "",
        year: String(initialData.year || ""),
        section: initialData.section || "",
        day: initialData.day || "",
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
        lectureType: initialData.lectureType || "THEORY",
        room: initialData.room || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData]);

  // Sections filtered by selected course + year
  const filteredSections = allSections.filter((s) => {
    if (!form.courseId) return false;
    const sectionCourseId = s.courseId?._id || s.courseId;
    const matchesCourse = sectionCourseId?.toString() === form.courseId;
    const matchesYear = !form.year || String(s.year) === String(form.year);
    return matchesCourse && matchesYear;
  });

  const inputCls =
    "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors";

  const submit = async () => {
    const { courseId, subjectId, facultyId, year, section, day, startTime, endTime, lectureType } = form;

    if (!courseId || !subjectId || !facultyId || !year || !section || !day || !startTime || !endTime || !lectureType) {
      return toast.error("All required fields must be filled");
    }

    if (startTime >= endTime) {
      return toast.error("End time must be after start time");
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/lectures/${initialData._id}`, form);
        toast.success("Lecture updated successfully");
      } else {
        await api.post("/lectures", form);
        toast.success("Lecture scheduled successfully");
        setForm(EMPTY_FORM);
      }
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save lecture");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Row 1: Course + Year */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course *</label>
          <select
            className={inputCls}
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value, section: "" })}
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.code ? `(${c.code})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Year *</label>
          <input
            className={inputCls}
            placeholder="e.g. 1"
            type="number"
            min="1"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value, section: "" })}
          />
        </div>
      </div>

      {/* Row 2: Section (dynamic) */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section *</label>
        {filteredSections.length > 0 ? (
          <select
            className={inputCls}
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
          >
            <option value="">Select Section</option>
            {filteredSections.map((s) => (
              <option key={s._id} value={s.section}>
                {s.section}
              </option>
            ))}
          </select>
        ) : (
          <input
            className={inputCls}
            placeholder={
              form.courseId && form.year
                ? "No sections found — type manually or create sections first"
                : "Select course & year first to load sections"
            }
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
          />
        )}
        {form.courseId && form.year && filteredSections.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            No sections found for this course/year. You can type manually or create sections in Course Registry.
          </p>
        )}
      </div>

      {/* Row 3: Subject */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject *</label>
        <select
          className={inputCls}
          value={form.subjectId}
          onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} {s.code ? `(${s.code})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Row 4: Faculty */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Faculty *</label>
        <select
          className={inputCls}
          value={form.facultyId}
          onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
        >
          <option value="">Select Faculty</option>
          {faculty.length === 0 && (
            <option disabled value="">No faculty found — add faculty first</option>
          )}
          {faculty.map((f) => (
            <option key={f._id} value={f._id}>
              {f.userId?.name || "Unknown"} ({f.employeeId})
            </option>
          ))}
        </select>
      </div>

      {/* Row 5: Day + Lecture Type */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Day *</label>
          <select
            className={inputCls}
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
          >
            <option value="">Select Day</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type *</label>
          <select
            className={inputCls}
            value={form.lectureType}
            onChange={(e) => setForm({ ...form, lectureType: e.target.value })}
          >
            {LECTURE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 6: Start Time + End Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Time *</label>
          <input
            type="time"
            className={inputCls}
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">End Time *</label>
          <input
            type="time"
            className={inputCls}
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </div>
      </div>

      {/* Row 7: Room (optional) */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Room <span className="normal-case font-normal">(optional)</span></label>
        <input
          className={inputCls}
          placeholder="e.g. Room 101, Lab A"
          value={form.room}
          onChange={(e) => setForm({ ...form, room: e.target.value })}
        />
      </div>

      {/* Submit */}
      <button
        onClick={submit}
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
        {submitting ? "Saving..." : isEdit ? "Save Changes" : "Schedule Lecture"}
      </button>
    </div>
  );
}
