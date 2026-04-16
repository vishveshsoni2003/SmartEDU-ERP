import asyncHandler from "../utils/asyncHandler.js";
import ImportJob from "../models/ImportJob.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { parseBufferToJSON, sanitizeRow } from "../services/import.service.js";

/**
 * DOWNLOAD TEMPLATE
 */
export const getStudentImportTemplate = asyncHandler(async (req, res) => {
    const headers = [
        "name", "email", "phone", "gender", "dob",
        "enrollmentNo", "rollNo", "department", "courseId",
        "year", "section", "studentType", "hostelId", "busId"
    ];
    const csvContent = headers.join(",") + "\n" +
        "John Doe,john@example.com,1234567890,M,2003-01-15,EN123,R123,CS,60c7a8b,1,A,DAY_SCHOLAR,,";

    res.setHeader("Content-Disposition", 'attachment; filename="student_import_template.csv"');
    res.setHeader("Content-Type", "text/csv");
    res.send(csvContent);
});

/**
 * GET IMPORT JOBS HISTORY
 */
export const getImportJobs = asyncHandler(async (req, res) => {
    const jobs = await ImportJob.find({ institutionId: req.user.institutionId, type: "STUDENTS" })
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 });
    res.json({ jobs });
});

/**
 * GET IMPORT JOB STATUS
 */
export const getImportJobStatus = asyncHandler(async (req, res) => {
    const job = await ImportJob.findById(req.params.id);
    if (!job || job.institutionId.toString() !== req.user.institutionId.toString()) {
        return res.status(404).json({ message: "Job not found" });
    }
    res.json({ job });
});

/**
 * UPLOAD AND TRIGGER PROCESSING
 */
export const importStudents = asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const job = await ImportJob.create({
        institutionId: req.user.institutionId,
        uploadedBy: req.user.userId,
        type: "STUDENTS",
        filename: req.file.originalname,
        status: "PROCESSING" // Instantly queue to processing
    });

    // Return immediately to user
    res.status(202).json({
        message: "Import job queued successfully",
        jobId: job._id
    });

    // Fire background processing
    processStudentImport(req.file.buffer, job._id, req.user.institutionId)
        .catch(console.error);
});

/**
 * BACKGROUND PROCESSING SYSTEM
 */
const processStudentImport = async (buffer, jobId, institutionId) => {
    const job = await ImportJob.findById(jobId);
    if (!job) return;

    try {
        const rawRows = parseBufferToJSON(buffer);
        job.totalRows = rawRows.length;
        await job.save();

        const errorSummary = [];
        let successCount = 0;
        let failedCount = 0;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const defaultPassword = await bcrypt.hash("Attendax@123", 10);

        for (let i = 0; i < rawRows.length; i++) {
            const row = sanitizeRow(rawRows[i]);
            const rowNum = i + 2; // Offset for header + 0-index

            try {
                // 1. Validate Core Requirements
                if (!row.name || !row.email || !row.enrollmentNo || !row.rollNo) {
                    throw new Error("Missing mandatory fields (name, email, enrollmentNo, rollNo)");
                }
                if (!emailRegex.test(row.email)) {
                    throw new Error("Invalid email format");
                }

                // 2. DB Uniqueness Constraints (Tenant-Scoped)
                const existingEmail = await User.findOne({ email: row.email, institutionId });
                if (existingEmail) throw new Error(`Email ${row.email} logically exists`);

                const existingStudent = await Student.findOne({
                    institutionId,
                    $or: [{ enrollmentNo: row.enrollmentNo }, { rollNo: row.rollNo }]
                });
                if (existingStudent) throw new Error("EnrollmentNo or RollNo collision");

                // 3. Attempt DB Writes (Sequential batching to limit transaction tearing in simple instances)
                const user = await User.create({
                    name: row.name,
                    email: row.email,
                    password: defaultPassword,
                    role: "STUDENT",
                    institutionId
                });

                await Student.create({
                    userId: user._id,
                    institutionId,
                    enrollmentNo: row.enrollmentNo,
                    rollNo: row.rollNo,
                    department: row.department,
                    courseId: row.courseId || null,
                    year: row.year ? Number(row.year) : 1,
                    section: row.section || "A",
                    studentType: row.studentType || "DAY_SCHOLAR",
                    hostelId: row.hostelId || null,
                    busId: row.busId || null,
                    gender: row.gender || "UNKNOWN",
                    phone: String(row.phone || "")
                });

                successCount++;

            } catch (err) {
                failedCount++;
                errorSummary.push({ row: rowNum, identifier: row.email || "Unknown", message: err.message });
            }

            // Progress reporting hook every 50 rows
            if (i % 50 === 0) {
                job.successRows = successCount;
                job.failedRows = failedCount;
                await job.save();
            }
        }

        job.successRows = successCount;
        job.failedRows = failedCount;
        job.errorSummary = errorSummary;
        job.status = failedCount === job.totalRows ? "FAILED" : "COMPLETED";
        await job.save();

    } catch (criticalErr) {
        job.status = "FAILED";
        job.errorSummary.push({ row: 0, identifier: "SYSTEM", message: criticalErr.message });
        await job.save();
    }
};
