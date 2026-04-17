import { useState, useEffect } from "react";
import {
    UploadCloud, FileSpreadsheet, Download, Loader2,
    CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronUp
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

/* ── Accepted header aliases shown in the UI ── */
const HEADER_GUIDE = [
    { canonical: "name",         accepted: "name, fullName, studentName, full name" },
    { canonical: "email",        accepted: "email, emailId, email address, e-mail" },
    { canonical: "enrollmentNo", accepted: "enrollmentNo, enrollment no, enrollment_no, enrollment" },
    { canonical: "rollNo",       accepted: "rollNo, roll no, roll_no, roll" },
    { canonical: "phone",        accepted: "phone, mobile, phoneNumber, mobile number" },
    { canonical: "year",         accepted: "year, studyYear, academic year" },
    { canonical: "section",      accepted: "section, div, division" },
    { canonical: "studentType",  accepted: "studentType, student type, type, category" },
    { canonical: "courseId",     accepted: "courseId, course id, course" },
];

export default function BulkStudentImport() {
    const [file,        setFile]        = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showGuide,   setShowGuide]   = useState(false);

    // Job tracking
    const [activeJobId, setActiveJobId] = useState(null);
    const [jobStatus,   setJobStatus]   = useState(null);
    const [jobHistory,  setJobHistory]  = useState([]);

    useEffect(() => { fetchHistory(); }, []);

    // Poll active job
    useEffect(() => {
        let id;
        if (activeJobId && (!jobStatus || ["PROCESSING", "PENDING"].includes(jobStatus.status))) {
            id = setInterval(async () => {
                try {
                    const res = await api.get(`/students/import/${activeJobId}/status`);
                    setJobStatus(res.data.job);
                    if (!["PROCESSING", "PENDING"].includes(res.data.job.status)) {
                        clearInterval(id);
                        fetchHistory();
                        if (res.data.job.status === "COMPLETED") toast.success("Import complete!");
                        else toast.error("Import failed — check error log below.");
                    }
                } catch { /* ignore polling errors */ }
            }, 2000);
        }
        return () => clearInterval(id);
    }, [activeJobId, jobStatus]);

    const fetchHistory = async () => {
        try {
            const res = await api.get("/students/import/history");
            setJobHistory(res.data.jobs || []);
        } catch { /* silent */ }
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await api.get("/students/import/template", { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a   = document.createElement("a");
            a.href = url;
            a.setAttribute("download", "student_import_template.csv");
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error("Failed to download template");
        }
    };

    const executeUpload = async () => {
        if (!file) return toast.error("Select a file first");
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        setJobStatus(null);
        try {
            const res = await api.post("/students/import", formData);
            setActiveJobId(res.data.jobId);
            setFile(null);
            toast.success("File uploaded — processing in background…");
        } catch (err) {
            // Show the full server error message (header mismatch details etc.)
            const msg = err.response?.data?.message || "Upload failed";
            toast.error(msg, { duration: 8000 });
        } finally {
            setIsUploading(false);
        }
    };

    const statusColor = (s) => {
        if (s === "COMPLETED") return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
        if (s === "FAILED")    return "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400";
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400";
    };

    return (
        <div className="space-y-6">

            {/* ── Header row ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Bulk Student Import
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Upload a <strong>.CSV</strong> or <strong>.XLSX</strong> file to create multiple student records at once.
                    </p>
                </div>
                <button
                    onClick={handleDownloadTemplate}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition"
                >
                    <Download className="h-4 w-4" />
                    Download Template
                </button>
            </div>

            {/* ── Header guide (collapsible) ─────────────── */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <button
                    onClick={() => setShowGuide(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                >
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <Info className="h-4 w-4 text-blue-500" />
                        Accepted column headers (click to expand)
                    </span>
                    {showGuide ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {showGuide && (
                    <div className="px-5 pb-5 pt-3 bg-white dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            The parser accepts all these header spellings (case-insensitive, spaces/underscores flexible).
                            <strong className="text-blue-600 dark:text-blue-400 ml-1">Required columns are marked ★</strong>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {HEADER_GUIDE.map(({ canonical, accepted }) => {
                                const required = ["name", "email", "enrollmentNo", "rollNo"].includes(canonical);
                                return (
                                    <div key={canonical} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                        <code className={`shrink-0 text-xs font-black px-2 py-0.5 rounded ${
                                            required
                                                ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                                                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                        }`}>
                                            {required && "★ "}{canonical}
                                        </code>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{accepted}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Upload zone + status panel ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Drop zone */}
                <label className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 hover:bg-blue-50 dark:hover:bg-blue-500/5 hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer flex flex-col items-center justify-center min-h-[200px]">
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={e => setFile(e.target.files[0] || null)}
                        disabled={isUploading}
                    />
                    <UploadCloud className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm text-center">
                        {file ? file.name : "Click or drag file here"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports .CSV and .XLSX"}
                    </p>
                </label>

                {/* Job status */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-center min-h-[200px]">
                    {!jobStatus ? (
                        <div className="text-center text-slate-500 dark:text-slate-400">
                            <FileSpreadsheet className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-sm font-medium">Upload a file to begin</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                                {["PROCESSING","PENDING"].includes(jobStatus.status) ? (
                                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                ) : jobStatus.status === "COMPLETED" ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                                )}
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {jobStatus.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{jobStatus.totalRows || 0}</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/30 p-3">
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Done</p>
                                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{jobStatus.successRows || 0}</p>
                                </div>
                                <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/30 p-3">
                                    <p className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Failed</p>
                                    <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{jobStatus.failedRows || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Upload button ──────────────────────────── */}
            <div className="flex justify-end">
                <button
                    onClick={executeUpload}
                    disabled={!file || isUploading || jobStatus?.status === "PROCESSING"}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
                >
                    {isUploading
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                        : <><UploadCloud className="h-4 w-4" /> Start Import</>
                    }
                </button>
            </div>

            {/* ── Job history ────────────────────────────── */}
            <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Import History</h4>
                {jobHistory.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No imports yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/60">
                                <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-600 dark:text-slate-400">
                                    <th className="py-3 px-4 font-semibold">Date</th>
                                    <th className="py-3 px-4 font-semibold">File</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold">Success</th>
                                    <th className="py-3 px-4 font-semibold">Errors</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {jobHistory.map(job => (
                                    <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 text-xs">
                                            {new Date(job.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white text-xs max-w-[160px] truncate">
                                            {job.filename}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                            {job.successRows} / {job.totalRows}
                                        </td>
                                        <td className="py-3 px-4">
                                            {job.errorSummary?.length > 0 ? (
                                                <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                                                    {job.errorSummary.slice(0, 8).map((e, i) => (
                                                        <div key={i} className="text-xs bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-1.5 rounded-lg">
                                                            <span className="font-bold">Row {e.row}</span>
                                                            {e.identifier && e.identifier !== `Row ${e.row}`
                                                                ? ` (${e.identifier})`
                                                                : ""
                                                            }: {e.message}
                                                        </div>
                                                    ))}
                                                    {job.errorSummary.length > 8 && (
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 italic pl-1">
                                                            +{job.errorSummary.length - 8} more…
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500 text-xs italic">None</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
