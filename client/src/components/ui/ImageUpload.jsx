import { useCallback, useState } from "react";
import { UploadCloud, X } from "lucide-react";

export default function ImageUpload({ onFileSelect, existingImage }) {
    const [preview, setPreview] = useState(existingImage || null);
    const [error, setError] = useState("");

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        setError("");

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size should not exceed 5MB");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Pass raw file to parent component representing FormData chunk
        if (onFileSelect) onFileSelect(file);

        // Free memory
        return () => URL.revokeObjectURL(objectUrl);
    }, [onFileSelect]);

    const clearImage = () => {
        setPreview(null);
        if (onFileSelect) onFileSelect(null);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">Profile Image</label>

            {preview ? (
                <div className="relative inline-block">
                    <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-xl border border-slate-200" />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <label className="mt-1 flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-8 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-colors bg-slate-50">
                    <div className="text-center">
                        <UploadCloud className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-slate-600">
                            <span className="relative rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                            </span>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-slate-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                </label>
            )}

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
    );
}
