import { useState, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, Download, Loader2, CheckCircle2, AlertTriangle, Users, BookOpen, Building, UserCheck, Layers, Book, Clock, Navigation, Calendar, Car } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { motion } from "framer-motion";

export default function BulkImport() {
    const [activeTab, setActiveTab] = useState("STUDENTS");
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [activeJobId, setActiveJobId] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [jobHistory, setJobHistory] = useState([]);

    const TABS = [
        { id: "STUDENTS", label: "Students", icon: <Users size={16} /> },
        { id: "FACULTY", label: "Faculty", icon: <UserCheck size={16} /> },
        { id: "COURSES", label: "Courses", icon: <BookOpen size={16} /> },
        { id: "SECTIONS", label: "Sections", icon: <Layers size={16} /> },
        { id: "SUBJECTS", label: "Subjects", icon: <Book size={16} /> },
        { id: "TIMETABLE", label: "Timetable", icon: <Clock size={16} /> },
        { id: "MENTORS", label: "Mentors", icon: <UserCheck size={16} /> },
        { id: "HOSTELS", label: "Hostels", icon: <Building size={16} /> },
        { id: "ROUTES", label: "Routes", icon: <Navigation size={16} /> },
        { id: "CALENDAR", label: "Calendar", icon: <Calendar size={16} /> },
        { id: "DRIVERS", label: "Drivers", icon: <Car size={16} /> },
    ];

    // Reset state on tab switch
    useEffect(() => {
        setFile(null);
        setActiveJobId(null);
        setJobStatus(null);
        fetchHistory(activeTab);
    }, [activeTab]);

    useEffect(() => {
        let intervalId;
        if (activeJobId && (!jobStatus || jobStatus.status === "PROCESSING" || jobStatus.status === "PENDING")) {
            intervalId = setInterval(async () => {
                try {
                    // Route maps to legacy and new unified endpoints seamlessly
                    const endpoint = activeTab === "STUDENTS"
                        ? `/students/import/${activeJobId}/status`
                        : `/bulk/${activeTab}/${activeJobId}/status`; // If implemented, else mock check or skip polling for generic

                    // Since generic bulk endpoint doesn't have a specific status endpoint yet, we just check history globally.
                    // Actually, let's just fetch history and find the job.
                    const res = await api.get(activeTab === "STUDENTS" ? "/students/import/history" : `/bulk/history?type=${activeTab}`);

                    const runningJob = res.data?.jobs?.find(j => j._id === activeJobId);

                    if (runningJob) {
                        setJobStatus(runningJob);
                        if (runningJob.status === "COMPLETED" || runningJob.status === "FAILED") {
                            clearInterval(intervalId);
                            if (runningJob.status === "COMPLETED") toast.success(`${activeTab} import processing complete!`);
                            else toast.error("Import failed critically.");
                            fetchHistory(activeTab);
                        }
                    } else {
                        // Fallback if generic route logic differs (it resolves fast enough anyway typically)
                        clearInterval(intervalId);
                    }
                } catch (err) {
                    // Silently fail polling
                }
            }, 3000);
        }
        return () => clearInterval(intervalId);
    }, [activeJobId, jobStatus, activeTab]);

    const fetchHistory = async (type) => {
        try {
            // Using legacy student route and new generic route mapping
            const url = type === "STUDENTS" ? "/students/import/history" : `/bulk/history?type=${type}`;
            // If the backend doesn't support generic history yet, we'll gracefully fallback
            const res = await api.get(url).catch(() => ({ data: { jobs: [] } }));
            setJobHistory(res.data.jobs || []);
        } catch {
            setJobHistory([]);
        }
    };

    const CSV_TEMPLATES = {
        STUDENTS: [
            "name,email,phone,gender,dateOfBirth,year,semester,section,courseCode,studentType,rollNo",
            "Aisha Mehta,aisha@example.com,9876543210,FEMALE,2005-03-15,1,1,A,BCA,DAY_SCHOLAR,STU001",
            "Rahul Sharma,rahul@example.com,9876543211,MALE,2004-07-22,2,3,B,MCA,HOSTELLER,STU002",
        ],
        FACULTY: [
            "name,email,phone,gender,qualification,department,facultyType,designation",
            "Dr. Priya Nair,priya@example.com,9876500001,FEMALE,PhD Computer Science,CS,TEACHING,Associate Professor",
            "Mr. Suresh Kumar,suresh@example.com,9876500002,MALE,M.Tech,ECE,TEACHING,Assistant Professor",
        ],
        COURSES: [
            "name,code,duration,totalSemesters,description",
            "Bachelor of Computer Applications,BCA,3,6,Undergraduate CS program",
            "Master of Computer Applications,MCA,2,4,Postgraduate CS program",
        ],
        SECTIONS: [
            "courseCode,year,semester,section,capacity",
            "BCA,1,1,A,60",
            "BCA,1,1,B,60",
        ],
        SUBJECTS: [
            "name,code,courseCode,year,semester,credits,type",
            "Data Structures,DS101,BCA,1,2,4,THEORY",
            "Database Management Systems,DBMS201,MCA,1,2,4,THEORY",
        ],
        TIMETABLE: [
            "courseCode,year,semester,section,subjectCode,facultyEmail,day,startTime,endTime,room",
            "BCA,1,1,A,DS101,priya@example.com,MONDAY,09:00,10:00,101",
            "BCA,1,1,A,DBMS201,suresh@example.com,TUESDAY,10:00,11:00,102",
        ],
        MENTORS: [
            "facultyEmail,courseCode,year,semester,section",
            "priya@example.com,BCA,1,1,A",
            "suresh@example.com,MCA,1,1,B",
        ],
        HOSTELS: [
            "name,type,totalRooms,roomCapacity,wardenEmail,address",
            "Boys Hostel Block A,BOYS,50,4,warden1@example.com,Campus North Wing",
            "Girls Hostel Block B,GIRLS,40,3,warden2@example.com,Campus South Wing",
        ],
        ROUTES: [
            "name,startPoint,endPoint,stops,distanceKm",
            "Route 1 - City Center,Main Gate,City Bus Stand,Stop A | Stop B | Stop C,12.5",
            "Route 2 - Railway Station,Main Gate,Railway Station,Stop D | Stop E,8.2",
        ],
        CALENDAR: [
            "title,date,type,description",
            "Independence Day,2026-08-15,NATIONAL_HOLIDAY,National holiday — institution closed",
            "Semester Exam Start,2026-11-01,EXAM,Semester examinations commence",
        ],
        DRIVERS: [
            "name,email,phone,gender,licenseNumber,routeName",
            "Ramesh Yadav,ramesh@example.com,9876511111,MALE,MH12AB1234,Route 1 - City Center",
            "Sunil Patil,sunil@example.com,9876522222,MALE,MH14CD5678,Route 2 - Railway Station",
        ],
    };

    const handleDownloadTemplate = () => {
        const rows = CSV_TEMPLATES[activeTab] || ["name,email", "Example Row"];
        const csvContent = rows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${activeTab.toLowerCase()}_template.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        toast.success(`${activeTab} template downloaded.`);
    };

    const executeUpload = async () => {
        if (!file) return toast.error("Please explicitly select a valid payload payload first.");

        const formData = new FormData();
        formData.append("file", file);

        try {
            setIsUploading(true);
            setJobStatus(null);

            const endpoint = activeTab === "STUDENTS" ? "/students/import" : `/bulk/${activeTab}`;
            const res = await api.post(endpoint, formData);

            setActiveJobId(res.data.jobId);
            setFile(null);
            toast.success("Payload mapped seamlessly. Processing in background...");

            // Instantly fetch history to show the pending job
            fetchHistory(activeTab);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed validating file format payload constraints.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
            {/* Header Tabs Navigation */}
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all shrink-0 ${activeTab === tab.id
                            ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border-b-2 border-blue-600 dark:border-blue-400 shadow-[0_4px_0_-2px_white] dark:shadow-none"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6 sm:p-8 relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="h-6 w-6 text-blue-500" /> Bulk Ingestion ({activeTab})
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl line-clamp-2">
                            Securely upload absolute matrix representations for {activeTab.toLowerCase()} bypassing memory constraints cleanly. Use the rigid template standard below.
                        </p>
                    </div>
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <Download className="h-4 w-4" />
                        Download Outline
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* DRAG & DROP ZONE */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={activeTab}
                        className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[220px] bg-slate-50 dark:bg-slate-800/50 group overflow-hidden"
                    >
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            onChange={(e) => setFile(e.target.files[0])}
                            disabled={isUploading}
                        />
                        <UploadCloud className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-4 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-300" />
                        <p className="text-slate-700 dark:text-slate-200 font-bold text-lg">{file ? file.name : `Select ${activeTab} Payload`}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Accepts .CSV format standard explicitly."}</p>
                    </motion.div>

                    {/* STATUS ZONE */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-center min-h-[220px]">
                        {!jobStatus ? (
                            <div className="text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                                <AlertTriangle className="h-10 w-10 text-amber-500/50 dark:text-amber-500/30 mb-3" />
                                <p className="font-semibold text-slate-700 dark:text-slate-300">Awaiting Payload Constraints</p>
                                <p className="text-xs max-w-[200px] mt-1 text-slate-400">System actively monitoring internal polling architecture for input.</p>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="flex items-center gap-3 mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                                    {jobStatus.status === "PROCESSING" || jobStatus.status === "PENDING" ? (
                                        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                    ) : jobStatus.status === "COMPLETED" ? (
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                    ) : (
                                        <AlertTriangle className="h-6 w-6 text-rose-500" />
                                    )}
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">
                                        Phase Mapping: {jobStatus.status}
                                    </h4>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Total Nodes</p>
                                        <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{jobStatus.totalRows || 0}</p>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">Resolved</p>
                                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{jobStatus.successRows || 0}</p>
                                    </div>
                                    <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-800/50">
                                        <p className="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-wider font-bold">Failed</p>
                                        <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{jobStatus.failedRows || 0}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end border-b border-slate-200 dark:border-slate-800 pb-8 mb-8">
                    <button
                        onClick={executeUpload}
                        disabled={!file || isUploading || (jobStatus && jobStatus.status === "PROCESSING")}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none w-full sm:w-auto"
                    >
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        {isUploading ? "Transmitting Pipeline Architecture..." : "Instantiate Target Matrix"}
                    </button>
                </div>

                {/* JOB HISTORY */}
                <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Building className="h-5 w-5 text-slate-400" /> Historical Injection Logs
                    </h4>
                    {jobHistory.length === 0 ? (
                        <div className="flex items-center justify-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No system matrix logs tracked in current dimension.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/50 rounded-xl">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700/50">
                                    <tr>
                                        <th className="py-3.5 px-4 tracking-wide uppercase text-xs">Date Imprint</th>
                                        <th className="py-3.5 px-4 tracking-wide uppercase text-xs">File Reference Node</th>
                                        <th className="py-3.5 px-4 tracking-wide uppercase text-xs">Process State</th>
                                        <th className="py-3.5 px-4 tracking-wide uppercase text-xs">Integrity Score</th>
                                        <th className="py-3.5 px-4 tracking-wide uppercase text-xs">Architectural Faults</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                    {jobHistory.map((job) => (
                                        <tr key={job._id} className="hover:bg-slate-50 hover:dark:bg-slate-800/50 transition-colors">
                                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{new Date(job.createdAt).toLocaleString()}</td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{job.filename}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${job.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                                    job.status === "FAILED" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                                    }`}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold tracking-tight">{job.successRows} / {job.totalRows}</td>
                                            <td className="py-3.5 px-4">
                                                {job.errorSummary?.length > 0 ? (
                                                    <div className="max-h-24 overflow-y-auto text-xs text-rose-500 pr-2 space-y-1 scrollbar-thin">
                                                        {job.errorSummary.slice(0, 5).map((err, i) => (
                                                            <div key={i} className="bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg font-medium border border-rose-100 dark:border-rose-500/20">Line {err.row}: {err.message}</div>
                                                        ))}
                                                        {job.errorSummary.length > 5 && <p className="text-slate-500 dark:text-slate-400 font-semibold italic">+{job.errorSummary.length - 5} fragmented bounds hidden</p>}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500 font-medium italic">— Pristine Transfer —</span>
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
        </div>
    );
}
