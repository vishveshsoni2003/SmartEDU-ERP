import xlsx from "xlsx";

/**
 * Parses a CSV or XLSX buffer into a raw array of row objects.
 * Header keys are whatever the file contains — normalizeRow() fixes them.
 */
export const parseBufferToJSON = (buffer) => {
    try {
        const workbook = xlsx.read(buffer, {
            type: "buffer",
            codepage: 65001,  // UTF-8
            raw: false
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rawData = xlsx.utils.sheet_to_json(sheet, {
            defval: "",      // empty cells → ""
            blankrows: false // skip fully empty rows
        });

        return rawData;
    } catch (error) {
        throw new Error(`Failed to parse file: ${error.message}`);
    }
};

/* ─────────────────────────────────────────────────────────────────
   FIELD ALIAS MAP
   Maps every accepted header variant → canonical field name.
   Keys are the lowercased, trimmed, BOM-stripped header text from
   the uploaded file. Values are the canonical names used in the
   controller (camelCase, matching the DB schema).
───────────────────────────────────────────────────────────────── */
const FIELD_ALIASES = {
    // name
    "name":                  "name",
    "fullname":              "name",
    "full name":             "name",
    "student name":          "name",
    "studentname":           "name",
    "full_name":             "name",

    // email
    "email":                 "email",
    "emailid":               "email",
    "email id":              "email",
    "email address":         "email",
    "emailaddress":          "email",
    "e-mail":                "email",
    "e_mail":                "email",

    // enrollmentNo
    "enrollmentno":          "enrollmentNo",
    "enrollment no":         "enrollmentNo",
    "enrollment_no":         "enrollmentNo",
    "enrollment":            "enrollmentNo",
    "enrollmentnum":         "enrollmentNo",
    "enrollment number":     "enrollmentNo",
    "enrollmentnumber":      "enrollmentNo",
    "enroll no":             "enrollmentNo",
    "enroll_no":             "enrollmentNo",
    "enrollno":              "enrollmentNo",

    // rollNo
    "rollno":                "rollNo",
    "roll no":               "rollNo",
    "roll_no":               "rollNo",
    "roll":                  "rollNo",
    "rollnumber":            "rollNo",
    "roll number":           "rollNo",
    "roll num":              "rollNo",
    "rollnum":               "rollNo",

    // phone
    "phone":                 "phone",
    "phonenumber":           "phone",
    "phone number":          "phone",
    "phone_number":          "phone",
    "mobile":                "phone",
    "mobilenumber":          "phone",
    "mobile number":         "phone",
    "mobile_number":         "phone",
    "contact":               "phone",
    "contactnumber":         "phone",

    // gender
    "gender":                "gender",
    "sex":                   "gender",

    // dob
    "dob":                   "dob",
    "date of birth":         "dob",
    "dateofbirth":           "dob",
    "birthdate":             "dob",
    "birth date":            "dob",
    "birth_date":            "dob",

    // department
    "department":            "department",
    "dept":                  "department",
    "branch":                "department",

    // courseId  — raw ObjectId OR human-readable name/code columns
    "courseid":              "courseId",
    "course id":             "courseId",
    "course_id":             "courseId",
    "course":                "courseId",         // will be resolved to ObjectId by controller
    "coursename":            "courseName",       // separate canonical so controller knows it's a name
    "course name":           "courseName",
    "course_name":           "courseName",
    "coursecode":            "courseCode",       // separate canonical so controller knows it's a code
    "course code":           "courseCode",
    "course_code":           "courseCode",
    "program":               "courseName",
    "programme":             "courseName",
    "degree":                "courseName",

    // year
    "year":                  "year",
    "studyyear":             "year",
    "study year":            "year",
    "academic year":         "year",
    "academicyear":          "year",

    // section
    "section":               "section",
    "class section":         "section",
    "classsection":          "section",
    "div":                   "section",
    "division":              "section",

    // studentType
    "studenttype":           "studentType",
    "student type":          "studentType",
    "student_type":          "studentType",
    "type":                  "studentType",
    "category":              "studentType",

    // hostelId  — raw ObjectId OR hostel name
    "hostelid":              "hostelId",
    "hostel id":             "hostelId",
    "hostel_id":             "hostelId",
    "hostel":                "hostelName",       // name → resolved to ObjectId by controller
    "hostelname":            "hostelName",
    "hostel name":           "hostelName",
    "hostel_name":           "hostelName",
    "dormitory":             "hostelName",

    // busId  — raw ObjectId OR bus number
    "busid":                 "busId",
    "bus id":                "busId",
    "bus_id":                "busId",
    "bus":                   "busNumber",        // bus number → resolved to ObjectId by controller
    "busnumber":             "busNumber",
    "bus number":            "busNumber",
    "bus_number":            "busNumber",
    "vehicle":               "busNumber",
    "vehicle number":        "busNumber",

    // password (optional — allows admin to set custom passwords)
    "password":              "password",
};

/**
 * Strips a BOM character (U+FEFF) that Excel/Windows adds to the start
 * of UTF-8 CSV files. Without this, the first header key looks like
 * "\uFEFFname" instead of "name" and never matches any alias.
 */
const stripBOM = (str) => str.replace(/^\uFEFF/, "");

/**
 * Normalizes a single raw header key:
 *   1. Strip BOM
 *   2. Trim whitespace
 *   3. Lowercase
 *   Result is used as the lookup key in FIELD_ALIASES.
 */
const normalizeHeaderKey = (key) =>
    stripBOM(String(key)).trim().toLowerCase();

/**
 * normalizeRow(rawRow)
 *
 * Takes one raw row object (keys = file headers, values = cell text)
 * and returns a new object with:
 *   - Canonical camelCase keys (via FIELD_ALIASES lookup)
 *   - Trimmed string values
 *   - Unknown headers preserved as-is (lowercased) so they don't silently vanish
 *
 * @param {object} rawRow - One row from parseBufferToJSON()
 * @returns {{ row: object, unknownHeaders: string[] }}
 */
export const normalizeRow = (rawRow) => {
    const row = {};
    const unknownHeaders = [];

    for (const key in rawRow) {
        const normalKey  = normalizeHeaderKey(key);
        const canonical  = FIELD_ALIASES[normalKey];
        const value      = typeof rawRow[key] === "string"
            ? rawRow[key].trim()
            : rawRow[key];

        if (canonical) {
            row[canonical] = value;
        } else {
            // Preserve unknown headers with their normalised key
            // so custom fields don't disappear silently
            row[normalKey] = value;
            unknownHeaders.push(key.trim());
        }
    }

    return { row, unknownHeaders };
};

/**
 * sanitizeRow — legacy compat wrapper.
 *
 * Old code called sanitizeRow() and then accessed row.enrollmentNo, etc.
 * That broke because the old version lowercased everything (enrollmentNo →
 * enrollmentno). This replacement runs normalizeRow() and returns just the
 * row so existing call-sites work without changes.
 *
 * New code should prefer normalizeRow() directly for access to unknownHeaders.
 */
export const sanitizeRow = (rawRow) => normalizeRow(rawRow).row;

/**
 * validateRequiredHeaders(firstRow)
 *
 * Call this before processing the batch to give a single up-front
 * error message listing every missing required header, rather than
 * failing row-by-row with a generic message.
 *
 * @param {object} firstRawRow - The first raw row from parseBufferToJSON()
 * @returns {string|null} Human-readable error string, or null if all present.
 */
export const validateRequiredHeaders = (firstRawRow) => {
    const REQUIRED_CANONICAL = ["name", "email", "enrollmentNo", "rollNo"];

    // Build a set of canonical names that ARE present in the file
    const present = new Set(
        Object.keys(firstRawRow).map(k => FIELD_ALIASES[normalizeHeaderKey(k)])
    );

    const missing = REQUIRED_CANONICAL.filter(f => !present.has(f));
    if (missing.length === 0) return null;

    // Build a helpful "expected X, found Y" message
    const REQUIRED_ALIASES = {
        name:         ["name", "fullName", "studentName", "full name"],
        email:        ["email", "emailId", "email address"],
        enrollmentNo: ["enrollmentNo", "enrollment no", "enrollment_no", "enrollment"],
        rollNo:       ["rollNo", "roll no", "roll_no", "roll"],
    };

    const lines = missing.map(f => {
        const found = Object.keys(firstRawRow)
            .map(k => k.trim())
            .filter(Boolean)
            .join(", ");
        const accepted = REQUIRED_ALIASES[f]?.join(" | ") ?? f;
        return `"${f}" (accepted: ${accepted}) — file has: [${found || "no headers"}]`;
    });

    return `Missing required column(s):\n${lines.join("\n")}`;
};
