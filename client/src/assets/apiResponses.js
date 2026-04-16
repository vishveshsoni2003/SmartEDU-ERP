/**
 * Attendax ERP
 * Mock API Responses for Frontend Testingvelopment
 * Replace these with real API calls later
 */

// ================= AUTH =================

export const authResponse = {
  loginSuccess: {
    message: "Login successful",
    token: "JWT_TOKEN",
    user: {
      id: "USER_ID",
      name: "Neeraj Soni",
      role: "STUDENT"
    }
  }
};

// ================= INSTITUTION =================

export const institutionResponse = {
  createInstitution: {
    message: "Institution created successfully",
    institution: {
      id: "ORG-001",
      name: "Attendax University",
      domain: "attendax.edu",
    }
  }
};

// ================= STUDENT =================

export const studentResponses = {
  createStudent: {
    message: "Student created successfully",
    studentId: "STUDENT_ID"
  },

  myProfile: {
    student: {
      enrollmentNo: "CS2025-001",
      studentType: "HOSTELLER",
      hostelId: "HOSTEL_ID",
      roomNumber: "101",
      user: {
        name: "Neeraj Soni",
        email: "neeraj@student.com"
      }
    }
  },

  studentList: {
    students: [
      {
        enrollmentNo: "CS2025-001",
        studentType: "HOSTELLER",
        user: {
          name: "Neeraj Soni",
          email: "neeraj@student.com"
        }
      }
    ]
  }
};

// ================= FACULTY =================

export const facultyResponses = {
  createFaculty: {
    message: "Faculty created successfully",
    facultyId: "FACULTY_ID"
  },

  myProfile: {
    faculty: {
      employeeId: "EMP1001",
      facultyType: ["LECTURER"],
      user: {
        name: "Prof. Sharma",
        email: "sharma@college.com"
      }
    }
  }
};

// ================= HOSTEL =================

export const hostelResponses = {
  createHostel: {
    message: "Hostel created successfully",
    hostelId: "HOSTEL_ID"
  },

  hostelWithRooms: {
    name: "A Block Hostel",
    type: "BOYS",
    rooms: [
      {
        roomNumber: "101",
        capacity: 3,
        occupants: ["STUDENT_ID"]
      }
    ]
  }
};

// ================= HOSTEL LEAVE =================

export const hostelLeaveResponses = {
  applyLeave: {
    message: "Leave applied successfully",
    leaveId: "LEAVE_ID"
  },

  pendingLeaves: [
    {
      studentName: "Neeraj Soni",
      fromDate: "2026-02-01",
      toDate: "2026-02-03",
      status: "PENDING"
    }
  ]
};

// ================= NOTICE BOARD =================

export const noticeResponses = {
  notices: [
    {
      title: "Hostel Fee Due",
      message: "Pay hostel fees before 10th Feb",
      targetAudience: ["HOSTELLERS"],
      postedAt: "2026-02-05"
    },
    {
      title: "Exam Schedule",
      message: "Mid-term exams from 15th Feb",
      targetAudience: ["STUDENTS"],
      postedAt: "2026-02-06"
    }
  ]
};

// ================= CLUB =================

export const clubResponses = {
  clubs: [
    {
      name: "Coding Club",
      description: "DSA and Competitive Programming",
      membersCount: 25
    }
  ],

  applicationStatus: {
    status: "APPROVED"
  }
};

// ================= TRANSPORT =================

export const transportResponses = {
  busDetails: {
    busNumber: "RJ14-BUS-01",
    route: {
      routeName: "Route A",
      stops: [
        { name: "Stop 1", lat: 26.91, lng: 75.78 },
        { name: "Stop 2", lat: 26.92, lng: 75.80 }
      ]
    },
    currentLocation: {
      lat: 26.9124,
      lng: 75.7873
    }
  }
};

// ================= TIMETABLE =================

export const timetableResponses = {
  lectures: [
    {
      subject: "Data Structures",
      day: "Monday",
      startTime: "10:00",
      endTime: "11:00",
      room: "C-101",
      faculty: "Prof. Sharma"
    }
  ]
};

// ================= ATTENDANCE =================

export const attendanceResponses = {
  studentAttendance: [
    {
      subject: "Data Structures",
      date: "2026-02-10",
      status: "PRESENT"
    }
  ],

  facultyAttendance: {
    date: "2026-02-10",
    inTime: "09:30",
    outTime: "17:00"
  }
};
