import API from "./api";

// ================= STUDENTS =================

// Get all students
export const getAllStudents = async () => {
  const res = await API.get("/students");
  return res.data;
};

// Create student
export const createStudent = async (data) => {
  const res = await API.post("/students", data);
  return res.data;
};

// Update student
export const updateStudent = async (id, data) => {
  const res = await API.put(`/students/${id}`, data);
  return res.data;
};

// Delete student
export const deleteStudent = async (id) => {
  const res = await API.delete(`/students/${id}`);
  return res.data;
};
// ================= FACULTY =================

// Get all faculty
export const getAllFaculty = async () => {
  const res = await API.get("/faculty");
  return res.data;
};

// Create faculty
export const createFaculty = async (data) => {
  const res = await API.post("/faculty", data);
  return res.data;
};

// Update faculty
export const updateFaculty = async (id, data) => {
  const res = await API.put(`/faculty/${id}`, data);
  return res.data;
};

// Delete faculty
export const deleteFaculty = async (id) => {
  const res = await API.delete(`/faculty/${id}`);
  return res.data;
};
// ================= NOTICES =================

// Get all notices (admin)
export const getAllNotices = async () => {
  const res = await API.get("/notices");
  return res.data;
};

// Create notice
export const createNotice = async (data) => {
  const res = await API.post("/notices", data);
  return res.data;
};
// ================= HOSTEL =================

// Get all hostels
export const getAllHostels = async () => {
  const res = await API.get("/hostels");
  return res.data;
};

// Create hostel
export const createHostel = async (data) => {
  const res = await API.post("/hostels", data);
  return res.data;
};

// Delete hostel
export const deleteHostel = async (hostelId) => {
  const res = await API.delete(`/hostels/${hostelId}`);
  return res.data;
};

// Allocate student to hostel
export const allocateHostel = async (data) => {
  const res = await API.post("/hostels/allocate", data);
  return res.data;
};
// ================= TRANSPORT =================

// Get all buses
export const getAllBuses = async () => {
  const res = await API.get("/transport/buses");
  return res.data;
};

// Create bus
export const createBus = async (data) => {
  const res = await API.post("/transport/buses", data);
  return res.data;
};

// Delete bus
export const deleteBus = async (busId) => {
  const res = await API.delete(`/transport/buses/${busId}`);
  return res.data;
};

// Get all routes
export const getAllRoutes = async () => {
  const res = await API.get("/transport/routes");
  return res.data;
};

// Create route
export const createRoute = async (data) => {
  const res = await API.post("/transport/routes", data);
  return res.data;
};

// Delete route
export const deleteRoute = async (routeId) => {
  const res = await API.delete(`/transport/routes/${routeId}`);
  return res.data;
};

// Get institution admins
export const getInstitutionAdmins = async () => {
  const res = await API.get("/admin/admins");
  return res.data;
};

// Create sub-admin
export const createInstitutionAdmin = async (data) => {
  const res = await API.post("/admin/create-admin", data);
  return res.data;
};

// Toggle admin active/deactivated status
export const toggleAdminStatus = async (id) => {
  const res = await API.patch(`/admin/admins/${id}/toggle-status`);
  return res.data;
};
// ROUTES


export const getRoutes = async () => {
  const res = await API.get("/transport/routes");
  return res.data;
};



// Get all drivers
export const getAllDrivers = async () => {
  const res = await API.get("/transport/drivers");
  return res.data;
};

// Create driver
export const createDriver = async (data) => {
  const res = await API.post("/drivers", data);
  return res.data;
};

// Delete driver
export const deleteDriver = async (driverId) => {
  const res = await API.delete(`/drivers/${driverId}`);
  return res.data;
};

// Assign bus to driver
export const assignBusToDriver = async (data) => {
  const res = await API.post("/transport/assign-driver", data);
  return res.data;
};

// Unassign bus from driver
export const unassignBusFromDriver = async (driverId) => {
  const res = await API.delete(`/transport/drivers/${driverId}/unassign`);
  return res.data;
};
