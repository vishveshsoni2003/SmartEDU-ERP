import API from "./api";

// Timetable for logged-in faculty
export const getFacultyTimetable = async () => {
  const res = await API.get("/timetable/faculty/today");
  return res.data;
};

// Mark attendance for a lecture
export const markAttendance = async ({ lectureId, presentStudentIds }) => {
  const res = await API.post("/attendance/mark", {
    lectureId,
    presentStudentIds
  });
  return res.data;
};

// Hostel leave approvals
export const getPendingHostelLeaves = async () => {
  const res = await API.get("/hostel-leaves/pending");
  return res.data;
};

export const approveHostelLeave = async (leaveId, data) => {
  const res = await API.patch(`/hostel-leaves/${leaveId}`, data);
  return res.data;
};
