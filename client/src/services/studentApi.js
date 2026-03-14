import API from "./api";

// Fetch notices for student
export const getStudentNotices = async () => {
  const res = await API.get("/notices");
  return res.data;
};

// Fetch timetable
export const getStudentTimetable = async () => {
  const res = await API.get("/timetable");
  return res.data;
};

// Fetch attendance
export const getStudentAttendance = async () => {
  const res = await API.get("/attendance/me");
  return res.data;
};

// Hostel leave requests
export const applyHostelLeave = async (leaveData) => {
  const res = await API.post("/hostel-leaves/apply", leaveData);
  return res.data;
};

export const getMyHostelLeaveRequests = async () => {
  const res = await API.get("/hostel-leaves/my-requests");
  return res.data;
};
