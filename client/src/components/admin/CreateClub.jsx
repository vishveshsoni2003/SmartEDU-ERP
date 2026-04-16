import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Users, Save } from "lucide-react";
import api from "../../services/api";
import ImageUpload from "../ui/ImageUpload";

export default function CreateClub({ onCreated }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        facultyInCharge: ""
    });

    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [facultyList, setFacultyList] = useState([]);

    useEffect(() => {
        // Fetch faculty members to assign as facultyInCharge
        api.get("/faculty")
            .then(res => setFacultyList(res.data?.faculty || res.data || []))
            .catch(() => { });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async () => {
        if (!form.name || !form.description) {
            return toast.error("Club Name and Description are explicitly mandatory.");
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);
            if (form.facultyInCharge) {
                formData.append("facultyInCharge", form.facultyInCharge);
            }

            // Map to exact multer upload field name 'image' or rather 'banner' wait backend expects req.file
            // Let's look at the upload middleware: `createUploadMiddleware("clubs", ["jpeg",...])`
            // Notice routes use `uploadClubBanner.single('image')`. I will append as 'image'
            if (imageFile) {
                formData.append("image", imageFile);
            }

            await api.post("/clubs", formData);
            toast.success("Club officially inaugurated!");

            if (onCreated) onCreated();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to structure club");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-4xl">
            <div className="border-b pb-4 mb-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                    <h3 className="text-xl font-semibold text-slate-800">Establish Inter-College Club</h3>
                    <p className="text-sm text-slate-500">Provide structured hubs mapping student memberships natively.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                {/* Full-width Image Uploader */}
                <div className="md:col-span-2 mb-2">
                    <ImageUpload onFileSelect={setImageFile} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Club Designation Title</label>
                    <input name="name" placeholder="E.g., Robotics Society" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" onChange={handleChange} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Faculty Overseer</label>
                    <select name="facultyInCharge" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" onChange={handleChange}>
                        <option value="">Unassigned</option>
                        {facultyList.map(f => <option key={f._id || f.id} value={f._id || f.id}>{f.name}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Charter Description</label>
                    <textarea name="description" placeholder="Explicit goals of this institution branch..." rows="4" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" onChange={handleChange} />
                </div>

            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={submit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Generating..." : "Establish Framework"}
                </button>
            </div>
        </div>
    );
}
