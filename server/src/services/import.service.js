import xlsx from "xlsx";

/**
 * Converts an uploaded CSV/Excel buffer into a standardized array of JSON objects.
 * Handles header normalization implicitly by relying on the first row.
 */
export const parseBufferToJSON = (buffer) => {
    try {
        // Read the buffer natively via SheetJS
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON, using the first row as header keys
        const rawData = xlsx.utils.sheet_to_json(sheet, {
            defval: "", // Default empty cells to empty strings
            blankrows: false // Skip entirely empty rows
        });

        return rawData;
    } catch (error) {
        throw new Error(`Failed to parse file: ${error.message}`);
    }
};

/**
 * Trims all string values in an object to prevent leading/trailing whitespace errors.
 * Also normalizes all KEYS to lowercase so template headers are case-insensitive.
 */
export const sanitizeRow = (row) => {
    const sanitized = {};
    for (const key in row) {
        const normalizedKey = key.trim().toLowerCase();
        if (typeof row[key] === "string") {
            sanitized[normalizedKey] = row[key].trim();
        } else {
            sanitized[normalizedKey] = row[key];
        }
    }
    return sanitized;
};
