import fs from "fs";
import { parse } from "csv-parse";
import path from "path";
import bcrypt from "bcryptjs";
import Course from "../models/Course.js";
import Hostel from "../models/Hostel.js";
import Faculty from "../models/Faculty.js";
import User from "../models/User.js";
import ImportJob from "../models/ImportJob.js";
import asyncHandler from "../utils/asyncHandler.js";

// Template configuration matrices
const TEMPLATES = {
    COURSES: "NAME,DURATION_YEARS,TOTAL_SEMESTERS,SPECIALIZATIONS\nComputer Science,4,8,AI;CyberSecurity",
    HOSTELS: "NAME,TYPE\nAlpha Boys Hostel,BOYS",
    FACULTY: "NAME,EMAIL,EMPLOYEE_ID,DESIGNATION\nDr. Smith,smith@attendax.edu,EMP001,LECTURER"
};

export const getImportTemplate = asyncHandler(async (req, res) => {
    let type = req.params.moduleType.toUpperCase();
    if (type === "HOSTEL") type = "HOSTELS";
    if (type === "COURSE") type = "COURSES";

    const content = TEMPLATES[type];
    if (!content) return res.status(404).json({ message: "Invalid template entity requested" });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${type.toLowerCase()}_template.csv`);
    res.send(content);
});

export const importGenericData = asyncHandler(async (req, res) => {
    let type = req.params.moduleType.toUpperCase();
    if (type === "HOSTEL") type = "HOSTELS";
    if (type === "COURSE") type = "COURSES";

    if (!TEMPLATES[type]) return res.status(400).json({ message: "Unsupported entity" });
    if (!req.file) return res.status(400).json({ message: "CSV file is mandatory" });

    const job = await ImportJob.create({
        institutionId: req.user.institutionId,
        uploadedBy: req.user.userId,
        type: type,
        filename: req.file.originalname,
        status: "PENDING"
    });

    res.status(202).json({
        message: "Background ingestion initiated seamlessly",
        jobId: job._id
    });

    processGenericImport(req.file.path, job._id, req.user.institutionId, type);
});

const sanitizeRow = (row) => {
    const clean = {};
    for (let key in row) {
        clean[key.trim().toUpperCase()] = row[key] ? row[key].trim() : "";
    }
    return clean;
};

async function processGenericImport(filePath, jobId, institutionId, type) {
    let job = await ImportJob.findById(jobId);
    if (!job) return;

    job.status = "PROCESSING";
    await job.save();

    const rawRows = [];
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(parse({ columns: true, skip_empty_lines: true }))
                .on("data", (data) => rawRows.push(data))
                .on("end", resolve)
                .on("error", reject);
        });

        job.totalRows = rawRows.length;
        await job.save();

        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < rawRows.length; i++) {
            const row = sanitizeRow(rawRows[i]);
            try {
                if (type === "COURSES") {
                    if (!row.NAME || !row.DURATION_YEARS || !row.TOTAL_SEMESTERS) throw new Error("Missing critical parameters");

                    await Course.create({
                        institutionId,
                        name: row.NAME,
                        durationYears: Number(row.DURATION_YEARS),
                        totalSemesters: Number(row.TOTAL_SEMESTERS),
                        specializations: row.SPECIALIZATIONS ? row.SPECIALIZATIONS.split(";").map(s => s.trim()) : []
                    });
                }

                else if (type === "HOSTELS") {
                    if (!row.NAME || !row.TYPE) throw new Error("Missing critical parameters");
                    if (!["BOYS", "GIRLS"].includes(row.TYPE.toUpperCase())) throw new Error("Invalid TYPE. Must be BOYS or GIRLS.");

                    await Hostel.create({
                        institutionId,
                        name: row.NAME,
                        type: row.TYPE.toUpperCase(),
                        rooms: [],
                        isActive: true
                    });
                }

                else if (type === "FACULTY") {
                    if (!row.NAME || !row.EMAIL || !row.EMPLOYEE_ID) throw new Error("Missing parameters");

                    // Validate existing user
                    const exists = await User.findOne({ email: row.EMAIL });
                    if (exists) throw new Error("Email already registered globally");

                    const facultyExists = await Faculty.findOne({ institutionId, employeeId: row.EMPLOYEE_ID });
                    if (facultyExists) throw new Error("Employee ID conflicts locally");

                    const hashedPassword = await bcrypt.hash("Attendax@123", 10);

                    const user = await User.create({
                        name: row.NAME,
                        email: row.EMAIL,
                        password: hashedPassword,
                        role: "FACULTY",
                        institutionId
                    });

                    await Faculty.create({
                        userId: user._id,
                        institutionId,
                        employeeId: row.EMPLOYEE_ID,
                        designation: row.DESIGNATION ? [row.DESIGNATION.toUpperCase()] : ["LECTURER"]
                    });
                }
                successCount++;
            } catch (err) {
                failedCount++;
                job.errorSummary.push({ row: i + 2, identifier: row.NAME || row.EMAIL || "Unknown Row", message: err.message });
            }
        }

        job.successRows = successCount;
        job.failedRows = failedCount;
        job.status = failedCount === rawRows.length && rawRows.length > 0 ? "FAILED" : "COMPLETED";

        await job.save();
    } catch (criticalErr) {
        job.status = "FAILED";
        job.errorSummary.push({ row: 0, identifier: "SYSTEM_CORE", message: "Catastrophic stream crash intercepting file parsing." });
        await job.save();
    } finally {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}
