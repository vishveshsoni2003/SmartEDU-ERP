import { useEffect, useState, useCallback } from "react";
import { Users, UserPlus, Shield } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import Skeleton from "../ui/Skeleton";

export default function ClubList() {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClubs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/clubs");
            setClubs(res.data.clubs || []);
        } catch (err) {
            toast.error("Failed to map active hub arrays.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClubs();
    }, [fetchClubs]);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-slate-800">Operational Hubs</h3>
                    <p className="text-sm text-slate-500 mt-1">Review active student branches and hierarchical allocations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full bg-slate-50 animate-pulse">
                            <div className="h-40 bg-slate-200" />
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="h-5 bg-slate-300 w-3/4 mb-3 rounded" />
                                <div className="h-4 bg-slate-200 w-full mb-1 rounded" />
                                <div className="h-4 bg-slate-200 w-5/6 mb-4 rounded" />
                            </div>
                        </div>
                    ))
                ) : clubs.length === 0 ? (
                    <div className="col-span-full text-center py-10 rounded-xl border border-dashed text-slate-500">
                        <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm">No hierarchical clubs mapped onto this tenant domain.</p>
                    </div>
                ) : (
                    clubs.map((c) => (
                        <div key={c._id} className="rounded-xl overflow-hidden shadow-sm border border-slate-200 flex flex-col h-full bg-white hover:shadow-md transition">

                            {/* BANNER FRAME */}
                            <div className="h-40 w-full bg-slate-100 relative group flex items-center justify-center overflow-hidden">
                                {c.banner?.url ? (
                                    <img src={c.banner.url} alt="Club Banner" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Shield className="h-8 w-8 mb-1 opacity-50" />
                                        <span className="text-xs uppercase tracking-wider font-semibold">Standard Hub</span>
                                    </div>
                                )}
                            </div>

                            {/* DETAILS */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg mb-2">{c.name}</h4>
                                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{c.description}</p>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                        <UserPlus className="h-3 w-3" />
                                        {c.members?.length || 0} Members
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">
                                        {c.facultyInCharge ? `Led by ~ ${c.facultyInCharge.userId?.name || 'Faculty'}` : "Independent"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
