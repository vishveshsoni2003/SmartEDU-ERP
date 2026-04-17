import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import CreateHostel from '../../components/admin/CreateHostel';
import HostelList from '../../components/admin/HostelList';

export default function AdminHostels() {
    const [listKey, setListKey] = useState(0);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Building2 className="text-blue-600 h-9 w-9" /> Hostel Infrastructure
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Control dormitory wings, establish room mappings, and track occupancy.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5">
                        <Card shadow="md" padding="lg">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Initialize New Construct</h3>
                            <CreateHostel onCreated={() => setListKey(prev => prev + 1)} />
                        </Card>
                    </div>

                    <div className="lg:col-span-7">
                        <Card shadow="md" padding="lg">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Established Facilities</h3>
                            <HostelList key={listKey} />
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
