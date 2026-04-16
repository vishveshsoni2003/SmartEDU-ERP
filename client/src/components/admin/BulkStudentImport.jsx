import { useState, useEffect, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Download, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function BulkStudentImport() {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Job Tracking State
    const [activeJobId, setActiveJobId] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [jobHistory, setJobHistory] = useState([]);

    // Fetch History On Mount
    useEffect(() => {
        fetchHistory();
    }, []);

    // Poll Job Status if active
    useEffect(() => {
        let intervalId;
        if (activeJobId && (!jobStatus || jobStatus.status === "PROCESSING" || jobStatus.status === "PENDING")) {
            intervalId = setInterval(async () => {
                try {
                    const res = await api.get(`/students/import/${activeJobId}/status`);
                    setJobStatus(res.data.job);
                    if (res.data.job.status !== "PROCESSING" && res.data.job.status !== "PENDING") {
                        clearInterval(intervalId);
                        fetchHistory(); // Refresh table when done
                        if (res.data.job.status === "COMPLETED") toast.success("Import processing complete!");
                        else toast.error("Import failed critically.");
                    }
                } catch (err) {
                    console.error("Failed to poll status", err);
                }
            }, 2000);
        }
        return () => clearInterval(intervalId);
    }, [activeJobId, jobStatus]);

    const fetchHistory = async () => {
        try {
            const res = await api.get("/students/import/history");
            setJobHistory(res.data.jobs || []);
        } catch {
            toast.error("Failed to load historical import jobs");
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await api.get("/students/import/template", { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "student_import_template.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            toast.error("Failed to download template");
        }
    };

    const executeUpload = async () => {
        if (!file) return toast.error("Please select a file first");

        const formData = new FormData();
        formData.append("file", file);

        try {
            setIsUploading(true);
            setJobStatus(null);
            const res = await api.post("/students/import", formData);
            setActiveJobId(res.data.jobId);
            setFile(null); // Clear selection
            toast.success("File uploaded successfully. Processing in background...");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white border rounded-xl shadow-sm p-6 max-w-5xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-slate-800">Bulk Data Ingestion</h3>
                    <p className="text-sm text-slate-500 mt-1">Simultaneously process thousands of student records using CSV or Excel payloads.</p>
                </div>
                <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition"
                >
                    <Download className="h-4 w-4" />
                    Template Reference
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* DRAG & DROP ZONE */}
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-blue-50 hover:border-blue-500 transition cursor-pointer flex flex-col items-center justify-center min-h-[220px]">
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={(e) => setFile(e.target.files[0])}
                        disabled={isUploading}
                    />
                    <UploadCloud className="h-10 w-10 text-slate-400 mb-4" />
                    <p className="text-slate-700 font-medium">{file ? file.name : "Drag & Drop Spreadsheet Here"}</p>
                    <p className="text-slate-500 text-sm mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports .CSV, .XLSX"}</p>
                </div>

                {/* ACTIVE JOB POLLER */}
                <div className="bg-slate-50 rounded-xl border p-6 flex flex-col justify-center min-h-[220px]">
                    {!jobStatus ? (
                        <div className="text-center text-slate-500">
                            <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p>Ready for ingestion stream.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-3 mb-4 border-b pb-4">
                                {jobStatus.status === "PROCESSING" || jobStatus.status === "PENDING" ? (
                                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                ) : jobStatus.status === "COMPLETED" ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                )}
                                <h4 className="font-semibold text-slate-800 text-lg">
                                    Phase: {jobStatus.status}
                                </h4>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-white p-3 rounded shadow-sm border">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Rows</p>
                                    <p className="text-2xl font-bold text-slate-800 mt-1">{jobStatus.totalRows || 0}</p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm border border-green-100">
                                    <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">Succeeded</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{jobStatus.successRows || 0}</p>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm border border-red-100">
                                    <p className="text-xs text-red-600 uppercase tracking-wider font-semibold">Failed</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">{jobStatus.failedRows || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end border-b pb-6 mb-6">
                <button
                    onClick={executeUpload}
                    disabled={!file || isUploading || (jobStatus && jobStatus.status === "PROCESSING")}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
                >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                    {isUploading ? "Transmitting payload..." : "Initiate Bulk Processing"}
                </button>
            </div>

            {/* JOB HISTORY & ERROR LOGS */}
            <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Historical Architecture Logs</h4>
                {jobHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">No historical import traces found for this institution.</p>
                ) : (
                    <div className="overflow-x-auto border rounded-xl">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">File Trace</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Success</th>
                                    <th className="py-3 px-4">Errors</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {jobHistory.map((job) => (
                                    <tr key={job._id} className="hover:bg-slate-50/50">
                                        <td className="py-3 px-4 text-slate-700">{new Date(job.createdAt).toLocaleString()}</td>
                                        <td className="py-3 px-4 font-medium text-slate-900">{job.filename}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${job.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                                    job.status === "FAILED" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-green-600 font-semibold">{job.successRows} / {job.totalRows}</td>
                                        <td className="py-3 px-4">
                                            {job.errorSummary?.length > 0 ? (
                                                <div className="max-h-24 overflow-y-auto text-xs text-red-500 pr-2">
                                                    {job.errorSummary.slice(0, 5).map((err, i) => (
                                                        <div key={i} className="mb-1 bg-red-50 p-1.5 rounded">Row {err.row}: {err.message}</div>
                                                    ))}
                                                    {job.errorSummary.length > 5 && <p className="text-slate-500 italic">+{job.errorSummary.length - 5} more...</p>}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">No defects</span>
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
