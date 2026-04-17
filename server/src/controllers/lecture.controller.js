import Faculty from "../models/Faculty.js";
import Lecture from "../models/Lecture.js";

/**
 * CREATE LECTURE (ADMIN)
 */
export const createLecture = async (req, res) => {
  try {
    const {
      courseId,
      subjectId,
      facultyId,
      year,
      section,
      day,
      startTime,
      endTime,
      lectureType
    } = req.body;

    // facultyId is Faculty._id (sent from frontend dropdown)
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(400).json({ message: "Invalid faculty" });
    }

    // Ensure faculty belongs to same institution
    if (faculty.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(400).json({ message: "Faculty does not belong to this institution" });
    }

    const lecture = await Lecture.create({
      institutionId: req.user.institutionId,
      courseId,
      subjectId,
      facultyId,   // Faculty._id — model refs Faculty
      year: Number(year),
      section,
      day,
      startTime,
      endTime,
      lectureType
    });

    // Return populated lecture for immediate display
    const populated = await Lecture.findById(lecture._id)
      .populate("subjectId", "name code")
      .populate("courseId", "name code")
      .populate({
        path: "facultyId",
        select: "employeeId userId",
        populate: { path: "userId", select: "name email" }
      });

    return res.status(201).json({
      message: "Lecture created successfully",
      lecture: populated
    });

  } catch (error) {
    console.error("Lecture error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "A lecture already exists for this slot (course/year/section/day/time)" });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET LECTURES
 * Used by Admin / Faculty / Student
 */
export const getLectures = async (req, res) => {
  try {
    const { courseId, year, section } = req.query;

    const filter = {
      institutionId: req.user.institutionId
    };

    // Admin / Student filters
    if (courseId) filter.courseId = courseId;
    if (year) filter.year = Number(year);
    if (section) filter.section = section;

    // Faculty sees only their own lectures
    // facultyId in Lecture refs Faculty (not User), so look up Faculty._id first
    if (req.user.role === "FACULTY") {
      const facultyRecord = await Faculty.findOne({
        userId: req.user.userId,
        institutionId: req.user.institutionId
      });
      if (!facultyRecord) {
        return res.json({ lectures: [] });
      }
      filter.facultyId = facultyRecord._id;
    }

    const lectures = await Lecture.find(filter)
      .populate("subjectId", "name code")
      .populate("courseId", "name code")
      .populate({
        path: "facultyId",
        select: "employeeId userId",
        populate: { path: "userId", select: "name email" }
      })
      .sort({ day: 1, startTime: 1 });

    res.json({ lectures });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE LECTURE (ADMIN)
 */
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;

    const lecture = await Lecture.findOne({
      _id: id,
      institutionId: req.user.institutionId
    });

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // If facultyId is being updated, validate it
    if (req.body.facultyId) {
      const faculty = await Faculty.findById(req.body.facultyId);
      if (!faculty || faculty.institutionId.toString() !== req.user.institutionId.toString()) {
        return res.status(400).json({ message: "Invalid faculty" });
      }
    }

    const updatePayload = { ...req.body };
    if (updatePayload.year) updatePayload.year = Number(updatePayload.year);

    const updated = await Lecture.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true
    })
      .populate("subjectId", "name code")
      .populate("courseId", "name code")
      .populate({
        path: "facultyId",
        select: "employeeId userId",
        populate: { path: "userId", select: "name email" }
      });

    res.json({ message: "Lecture updated successfully", lecture: updated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A lecture already exists for this slot" });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE LECTURE (ADMIN)
 */
export const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;

    const lecture = await Lecture.findOne({
      _id: id,
      institutionId: req.user.institutionId
    });

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    await Lecture.findByIdAndDelete(id);
    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
