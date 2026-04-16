import React, { useState } from 'react';
import { Shield, PlusSquare, Network } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ClubList from '../../components/admin/ClubList';
import CreateClub from '../../components/admin/CreateClub';

const TAB_CLS = (active) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${active
        ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
    }`;

export default function AdminClubs() {
    const [activeTab, setActiveTab] = useState("LOGS");
    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Shield className="text-blue-600 h-9 w-9" /> Institution Clubs
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage student clubs, hierarchies, and active hubs.</p>
                </div>
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-max border border-slate-200 dark:border-slate-800">
                    <button onClick={() => setActiveTab("LOGS")} className={TAB_CLS(activeTab === "LOGS")}>
                        <Network className="h-4 w-4" /> Active Hubs
                    </button>
                    <button onClick={() => setActiveTab("CREATE")} className={TAB_CLS(activeTab === "CREATE")}>
                        <PlusSquare className="h-4 w-4" /> Establish Club
                    </button>
                </div>
                <div className="animate-in fade-in duration-200">
                    {activeTab === "CREATE"
                        ? <CreateClub onCreated={() => setActiveTab("LOGS")} />
                        : <ClubList />
                    }
                </div>
            </div>
        </DashboardLayout>
    );
}
