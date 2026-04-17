import Student from "../models/Student.js";
import Holiday from "../models/Holiday.js";
import MentorAttendance from "../models/MentorAttendance.js";
import Lecture from "../models/Lecture.js";
import LectureAttendance from "../models/LectureAttendance.js";
import Faculty from "../models/Faculty.js";

/**
 * MARK LECTURE ATTENDANCE (FACULTY)
 */
export const markLectureAttendance = async (req, res) => {
  try {
    const { lectureId, date, presentStudents } = req.body;

    if (!lectureId || !date || !presentStudents) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    // Ensure faculty owns the lecture
    const faculty = await Faculty.findOne({
      userId: req.user.userId,
    });

    if (!faculty || !lecture.facultyId.equals(faculty._id)) {
      return res.status(403).json({
        message: "Not authorized to mark this lecture",
      });
    }

    const attendance = await LectureAttendance.findOneAndUpdate(
      { lectureId, date },
      {
        institutionId: req.user.institutionId,
        lectureId,
        date,
        facultyId: faculty._id,   // Faculty._id — matches LectureAttendance.facultyId ref
        presentStudents,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Attendance already marked for this lecture",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * MARK MENTOR ATTENDANCE (MENTOR FACULTY)
 */
export const markMentorAttendance = async (req, res) => {
  try {
    const { courseId, year, section, date, session, presentStudents } =
      req.body;

    if (!courseId || !year || !section || !date || !session) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const attendance = await MentorAttendance.create({
      institutionId: req.user.institutionId,
      courseId,
      year,
      section,
      mentorId: req.user.userId,
      date,
      session,
      presentStudents,
    });

    res.status(201).json({
      message: "Mentor attendance marked",
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Attendance already marked",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET LECTURE ATTENDANCE PERCENTAGE (STUDENT)
 */
export const getLectureAttendancePercentage = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // 1️⃣ Get lectures of student's class
    const lectures = await Lecture.find({
      institutionId: student.institutionId,
      courseId: student.courseId,
      year: student.year,
      section: student.section,
    });

    const lectureIds = lectures.map((l) => l._id);

    // 2️⃣ Get lecture attendance records
    const attendances = await LectureAttendance.find({
      lectureId: { $in: lectureIds },
    });

    // 3️⃣ Get holidays
    const holidays = await Holiday.find({
      institutionId: student.institutionId,
    });

    const isHoliday = (date) =>
      holidays.some(
        (h) => date >= h.startDate && date <= h.endDate
      );

    let totalLectures = 0;
    let attendedLectures = 0;

    attendances.forEach((a) => {
      const d = new Date(a.date);

      // ❌ Skip Sunday
      if (d.getDay() === 0) return;

      // ❌ Skip holiday
      if (isHoliday(d)) return;

      totalLectures++;

      if (a.presentStudents.map(id => id.toString()).includes(student._id.toString())) {
        attendedLectures++;
      }
    });

    res.json({
      type: "LECTURE",
      totalLectures,
      attendedLectures,
      percentage:
        totalLectures === 0
          ? 0
          : ((attendedLectures / totalLectures) * 100).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * GET MENTOR ATTENDANCE PERCENTAGE (STUDENT)
 */
export const getMentorAttendancePercentage = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Mentor attendance applies to student's class
    const attendances = await MentorAttendance.find({
      institutionId: student.institutionId,
      courseId: student.courseId,
      year: student.year,
      section: student.section
    });

    const holidays = await Holiday.find({
      institutionId: student.institutionId
    });

    const isHoliday = (date) =>
      holidays.some(
        (h) => date >= h.startDate && date <= h.endDate
      );

    let totalSessions = 0;
    let attendedSessions = 0;

    attendances.forEach((a) => {
      const d = new Date(a.date);

      // Skip Sunday
      if (d.getDay() === 0) return;

      // Skip holiday
      if (isHoliday(d)) return;

      totalSessions++;

      if (a.presentStudents.map(id => id.toString()).includes(student._id.toString())) {
        attendedSessions++;
      }
    });

    res.json({
      type: "MENTOR",
      totalSessions,
      attendedSessions,
      percentage:
        totalSessions === 0
          ? 0
          : ((attendedSessions / totalSessions) * 100).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET LECTURE ATTENDANCE HISTORY (FACULTY)
 * Returns attendance records for all lectures assigned to this faculty
 */
export const getLectureAttendanceHistory = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ userId: req.user.userId });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const { lectureId, from, to } = req.query;

    // Get lectures belonging to this faculty
    const lectureFilter = {
      institutionId: req.user.institutionId,
      facultyId: faculty._id
    };
    if (lectureId) lectureFilter._id = lectureId;

    const lectures = await Lecture.find(lectureFilter)
      .populate("subjectId", "name code")
      .populate("courseId", "name");

    const lectureIds = lectures.map(l => l._id);

    // Build attendance filter
    const attFilter = { lectureId: { $in: lectureIds } };
    if (from || to) {
      attFilter.date = {};
      if (from) attFilter.date.$gte = new Date(from);
      if (to)   attFilter.date.$lte = new Date(to);
    }

    const records = await LectureAttendance.find(attFilter)
      .populate({
        path: "lectureId",
        populate: [
          { path: "subjectId", select: "name code" },
          { path: "courseId", select: "name" }
        ]
      })
      .sort({ date: -1 })
      .limit(100);

    // Enrich each record with present count
    const enriched = records.map(r => ({
      _id: r._id,
      date: r.date,
      lecture: {
        _id: r.lectureId?._id,
        subject: r.lectureId?.subjectId?.name,
        course: r.lectureId?.courseId?.name,
        year: r.lectureId?.year,
        section: r.lectureId?.section,
        day: r.lectureId?.day,
        startTime: r.lectureId?.startTime,
        endTime: r.lectureId?.endTime
      },
      presentCount: r.presentStudents?.length || 0,
      presentStudents: r.presentStudents
    }));

    res.json({ records: enriched, total: enriched.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
