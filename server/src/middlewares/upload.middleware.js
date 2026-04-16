import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/**
 * Creates an upload middleware instance
 * @param {string} folderName - Subfolder in Cloudinary (e.g., "students", "notices", "institutions", "faculty", "clubs")
 * @param {Array<string>} allowedFormats - Array of allowed formats (e.g., ["jpeg", "png", "jpg", "pdf"])
 * @param {number} maxFileSizeMB - Maximum file size in MB
 */
export const createUploadMiddleware = (folderName = "general", allowedFormats = ["jpeg", "png", "jpg"], maxFileSizeMB = 5) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `AttendaxERP/${folderName}`,
            allowed_formats: allowedFormats,
            // Use resource_type 'auto' to support PDFs/docs as well as images
            resource_type: "auto",
            transformation: [{ width: 1000, crop: "limit", quality: "auto", fetch_format: "auto" }]
        },
    });

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: maxFileSizeMB * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            // Basic mime validation block if needed
            // Cloudinary allowed_formats will reject anyway, but catching early is good
            cb(null, true);
        }
    });

    return upload;
};

// Pre-configured middlewares matching requirements
export const uploadStudentProfile = createUploadMiddleware("students", ["jpeg", "png", "jpg"], 5);
export const uploadFacultyProfile = createUploadMiddleware("faculty", ["jpeg", "png", "jpg"], 5);
export const uploadClubBanner = createUploadMiddleware("clubs", ["jpeg", "png", "jpg"], 10);
export const uploadNoticeAttachment = createUploadMiddleware("notices", ["jpeg", "png", "jpg", "pdf"], 10);
export const uploadInstitutionLogo = createUploadMiddleware("institutions", ["jpeg", "png"], 5);

/**
 * GENERIC LOCAL BUFFER IMPORT
 * Used strictly for parsing CSV/Excel files in memory buffers to avoid hitting external Cloudinary buckets during bulk ingestion.
 */
export const uploadFileMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only CSV and Excel files are allowed."));
        }
    }
});
