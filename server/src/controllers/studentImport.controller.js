import asyncHandler from "../utils/asyncHandler.js";
import ImportJob from "../models/ImportJob.js";
import Student   from "../models/Student.js";
import User      from "../models/User.js";
import Course    from "../models/Course.js";
import Hostel    from "../models/Hostel.js";
import Bus       from "../models/Bus.js";
import bcrypt    from "bcryptjs";
import {
    parseBufferToJSON,
    normalizeRow,
    validateRequiredHeaders
} from "../services/import.service.js";

/* ─────────────────────────────────────────────────────
   TEMPLATE DOWNLOAD
   Uses human-readable column names (course name, hostel name,
   bus number) so admins don't need MongoDB ObjectIds in CSVs.
───────────────────────────────────────────────────── */
export const getStudentImportTemplate = asyncHandler(async (req, res) => {
    const headerRow  = "name,email,phone,year,section,studentType,enrollmentNo,rollNo,course,hostel,bus";
    const sampleRow1 = "John Doe,john@example.com,9876543210,1,A,DAY_SCHOLAR,EN2024001,R001,BCA,,";
    const sampleRow2 = "Jane Smith,jane@example.com,9876543211,2,B,HOSTELLER,EN2024002,R002,BCA,Boys Hostel 1,";
    const sampleRow3 = "Raj Kumar,raj@example.com,9876543212,1,A,BUS_SERVICE,EN2024003,R003,BSc,,Route-01";

    const notes = [
        "# NOTES:",
        "# course   - Enter course name exactly as created in the system (e.g. BCA, BSc, MBA)",
        "# hostel   - Enter hostel name for HOSTELLER students (leave blank for others)",
        "# bus      - Enter bus number for BUS_SERVICE students (leave blank for others)",
        "# studentType - DAY_SCHOLAR | HOSTELLER | BUS_SERVICE",
        "# year     - 1, 2, 3, 4 ...",
        "# section  - A, B, C ...",
        "#",
        "# You can also use raw MongoDB ObjectIds in courseId, hostelId, busId columns.",
    ].join("\n");

    const csv = [headerRow, sampleRow1, sampleRow2, sampleRow3, notes].join("\n");

    res.setHeader("Content-Disposition", 'attachment; filename="student_import_template.csv"');
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    // UTF-8 BOM — ensures Excel opens without encoding dialog
    res.send("\uFEFF" + csv);
});

/* ─────────────────────────────────────────────────────
   IMPORT HISTORY
───────────────────────────────────────────────────── */
export const getImportJobs = asyncHandler(async (req, res) => {
    const jobs = await ImportJob.find({
        institutionId: req.user.institutionId,
        type: "STUDENTS"
    })
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 });
    res.json({ jobs });
});

/* ─────────────────────────────────────────────────────
   IMPORT JOB STATUS POLL
───────────────────────────────────────────────────── */
export const getImportJobStatus = asyncHandler(async (req, res) => {
    const job = await ImportJob.findById(req.params.id);
    if (!job || job.institutionId.toString() !== req.user.institutionId.toString()) {
        return res.status(404).json({ message: "Job not found" });
    }
    res.json({ job });
});

/* ─────────────────────────────────────────────────────
   UPLOAD + QUEUE BACKGROUND JOB
───────────────────────────────────────────────────── */
export const importStudents = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    let rawRows;
    try {
        rawRows = parseBufferToJSON(req.file.buffer);
    } catch (parseErr) {
        return res.status(400).json({ message: parseErr.message });
    }

    if (!rawRows?.length) {
        return res.status(400).json({ message: "The uploaded file is empty or has no data rows." });
    }

    // Pre-flight header validation (synchronous — fast)
    const headerError = validateRequiredHeaders(rawRows[0]);
    if (headerError) {
        return res.status(400).json({ message: headerError });
    }

    const job = await ImportJob.create({
        institutionId: req.user.institutionId,
        uploadedBy:    req.user.userId,
        type:          "STUDENTS",
        filename:      req.file.originalname,
        status:        "PROCESSING"
    });

    res.status(202).json({
        message: "Import queued. Processing in background.",
        jobId: job._id
    });

    processStudentImport(rawRows, job._id, req.user.institutionId).catch(console.error);
});

/* ─────────────────────────────────────────────────────
   BACKGROUND PROCESSOR
───────────────────────────────────────────────────── */
const processStudentImport = async (rawRows, jobId, institutionId) => {
    const job = await ImportJob.findById(jobId);
    if (!job) return;

    try {
        job.totalRows = rawRows.length;
        await job.save();

        /* ── Build per-batch lookup caches ──────────────────────
           Load all Courses, Hostels, and Buses for this institution
           ONCE before the row loop, then resolve names → ObjectIds
           in memory. This avoids N×3 individual DB queries.
        ──────────────────────────────────────────────────────── */
        const [allCourses, allHostels, allBuses] = await Promise.all([
            Course.find({ institutionId }).lean(),
            Hostel.find({ institutionId }).lean(),
            Bus.find({ institutionId }).lean()
        ]);

        // course: key = lowercase name, value = ObjectId string
        const courseByName = Object.fromEntries(
            allCourses.map(c => [c.name.toLowerCase().trim(), c._id.toString()])
        );
        // Also index by code if Course model has a "code" field
        const courseByCode = Object.fromEntries(
            allCourses
                .filter(c => c.code)
                .map(c => [c.code.toLowerCase().trim(), c._id.toString()])
        );

        // hostel: key = lowercase name
        const hostelByName = Object.fromEntries(
            allHostels.map(h => [h.name.toLowerCase().trim(), h._id.toString()])
        );

        // bus: key = lowercase bus number
        const busByNumber = Object.fromEntries(
            allBuses.map(b => [b.busNumber.toLowerCase().trim(), b._id.toString()])
        );

        /* ── Row processing ─────────────────────────────────── */
        const errorSummary    = [];
        let   successCount    = 0;
        let   failedCount     = 0;

        const emailRegex      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const MONGO_ID_REGEX  = /^[a-f\d]{24}$/i;
        const defaultPassword = await bcrypt.hash("Attendax@123", 10);

        for (let i = 0; i < rawRows.length; i++) {
            const { row } = normalizeRow(rawRows[i]);
            const rowNum  = i + 2;

            try {
                /* ── Required field check ───────────────────── */
                const missing = [];
                if (!row.name)         missing.push("name");
                if (!row.email)        missing.push("email");
                if (!row.enrollmentNo) missing.push("enrollmentNo");
                if (!row.rollNo)       missing.push("rollNo");

                if (missing.length > 0) {
                    const present = Object.keys(rawRows[i]).map(k => k.trim()).join(", ");
                    throw new Error(
                        `Missing field(s): ${missing.join(", ")}. Row columns: [${present || "none"}]`
                    );
                }

                if (!emailRegex.test(row.email)) {
                    throw new Error(`Invalid email format: "${row.email}"`);
                }

                /* ── Resolve courseId ───────────────────────────
                   Priority:
                     1. row.courseId  → valid 24-char hex ObjectId → use directly
                     2. row.courseId  → name/code string → look up cache
                     3. row.courseName → look up by name
                     4. row.courseCode → look up by code
                     5. None provided  → courseId = null → Mongoose will reject (required)
                ──────────────────────────────────────────────── */
                let resolvedCourseId = null;
                const courseInput    = row.courseId || row.courseName || row.courseCode || "";

                if (courseInput) {
                    if (MONGO_ID_REGEX.test(courseInput)) {
                        // Looks like a real ObjectId — trust it directly
                        resolvedCourseId = courseInput;
                    } else {
                        // Human-readable name/code — look up in cache
                        const key = courseInput.toLowerCase().trim();
                        resolvedCourseId =
                            courseByName[key] ??
                            courseByCode[key] ??
                            null;

                        if (!resolvedCourseId) {
                            const available = allCourses.map(c => `"${c.name}"`).join(", ") || "none";
                            throw new Error(
                                `Course "${courseInput}" not found. ` +
                                `Available courses: [${available}]. ` +
                                `Create the course first, then re-import.`
                            );
                        }
                    }
                }

                if (!resolvedCourseId) {
                    throw new Error(
                        `courseId is required. Provide column "course" (course name) or "courseId" (MongoDB ID).`
                    );
                }

                /* ── Resolve hostelId ───────────────────────────
                   Priority:
                     1. row.hostelId → ObjectId → use directly
                     2. row.hostelName → look up by name
                     3. Both empty → hostelId = null (OK for non-hostellers)
                ──────────────────────────────────────────────── */
                let resolvedHostelId = null;
                const hostelInput    = row.hostelId || row.hostelName || "";

                if (hostelInput) {
                    if (MONGO_ID_REGEX.test(hostelInput)) {
                        resolvedHostelId = hostelInput;
                    } else {
                        const key = hostelInput.toLowerCase().trim();
                        resolvedHostelId = hostelByName[key] ?? null;

                        if (!resolvedHostelId) {
                            const available = allHostels.map(h => `"${h.name}"`).join(", ") || "none";
                            throw new Error(
                                `Hostel "${hostelInput}" not found. ` +
                                `Available hostels: [${available}].`
                            );
                        }
                    }
                }

                /* ── Validate HOSTELLER has hostelId ────────── */
                const validTypes  = ["HOSTELLER", "DAY_SCHOLAR", "BUS_SERVICE"];
                const rawType     = String(row.studentType || "").trim().toUpperCase().replace(/\s+/g, "_");
                const studentType = validTypes.includes(rawType) ? rawType : "DAY_SCHOLAR";

                if (studentType === "HOSTELLER" && !resolvedHostelId) {
                    throw new Error(
                        `studentType is HOSTELLER but no hostel provided. ` +
                        `Add a "hostel" column with the hostel name.`
                    );
                }

                /* ── Resolve busId ──────────────────────────────
                   Priority:
                     1. row.busId → ObjectId → use directly
                     2. row.busNumber → look up by bus number
                     3. Both empty → busId = null (OK for non-bus-service students)
                ──────────────────────────────────────────────── */
                let resolvedBusId = null;
                const busInput    = row.busId || row.busNumber || "";

                if (busInput) {
                    if (MONGO_ID_REGEX.test(busInput)) {
                        resolvedBusId = busInput;
                    } else {
                        const key = busInput.toLowerCase().trim();
                        resolvedBusId = busByNumber[key] ?? null;

                        if (!resolvedBusId) {
                            const available = allBuses.map(b => `"${b.busNumber}"`).join(", ") || "none";
                            throw new Error(
                                `Bus "${busInput}" not found. ` +
                                `Available buses: [${available}].`
                            );
                        }
                    }
                }

                if (studentType === "BUS_SERVICE" && !resolvedBusId) {
                    throw new Error(
                        `studentType is BUS_SERVICE but no bus provided. ` +
                        `Add a "bus" column with the bus number.`
                    );
                }

                /* ── DB uniqueness checks ───────────────────── */
                const existingUser = await User.findOne({ email: row.email });
                if (existingUser) {
                    throw new Error(`Email already registered: ${row.email}`);
                }

                const existingStudent = await Student.findOne({
                    institutionId,
                    $or: [
                        { enrollmentNo: row.enrollmentNo },
                        { rollNo: row.rollNo }
                    ]
                });
                if (existingStudent) {
                    throw new Error(
                        `Duplicate: enrollmentNo "${row.enrollmentNo}" or rollNo "${row.rollNo}" already registered`
                    );
                }

                /* ── Create User + Student ──────────────────── */
                const user = await User.create({
                    name:          row.name,
                    email:         row.email,
                    password:      row.password
                        ? await bcrypt.hash(row.password, 10)
                        : defaultPassword,
                    role:          "STUDENT",
                    institutionId
                });

                try {
                    await Student.create({
                        userId:       user._id,
                        institutionId,
                        enrollmentNo: row.enrollmentNo,
                        rollNo:       row.rollNo,
                        courseId:     resolvedCourseId,
                        year:         row.year ? Number(row.year) : 1,
                        section:      String(row.section || "A").trim().toUpperCase(),
                        studentType,
                        hostelId:     resolvedHostelId  || null,
                        busId:        resolvedBusId     || null,
                        phone:        String(row.phone  || ""),
                        department:   String(row.department || ""),
                    });
                } catch (dbErr) {
                    // Roll back orphan User if Student creation fails
                    await User.findByIdAndDelete(user._id);
                    throw dbErr;
                }

                successCount++;

            } catch (err) {
                failedCount++;
                errorSummary.push({
                    row:        rowNum,
                    identifier: (row?.email || row?.enrollmentNo || `Row ${rowNum}`),
                    message:    err.message
                });
            }

            // Persist progress every 50 rows
            if ((i + 1) % 50 === 0) {
                job.successRows = successCount;
                job.failedRows  = failedCount;
                await job.save();
            }
        }

        job.successRows  = successCount;
        job.failedRows   = failedCount;
        job.errorSummary = errorSummary;
        job.status       = failedCount === job.totalRows ? "FAILED" : "COMPLETED";
        await job.save();

    } catch (criticalErr) {
        job.status       = "FAILED";
        job.errorSummary = [{ row: 0, identifier: "SYSTEM", message: criticalErr.message }];
        await job.save();
    }
};
