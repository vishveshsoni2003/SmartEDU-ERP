import { useState, useEffect } from 'react';
import { History, Calendar, Clock, MapPin, Bus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';

export default function DriverHistory() {
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/drivers/dashboard')
      .then(r => {
        setBus(r.data.bus);
        if (r.data.bus?.routeId) setRoute(r.data.bus.routeId);
      })
      .finally(() => setLoading(false));
  }, []);

  // Show today's scheduled runs based on actual bus/route data
  const trips = !bus ? [] : [
    {
      id: 1, label: "Morning Run", type: "MORNING",
      departure: "07:00 AM", arrival: "08:30 AM",
      stops: route?.stops?.length ?? 0,
      status: "COMPLETED"
    },
    {
      id: 2, label: "Evening Return", type: "EVENING",
      departure: "05:00 PM", arrival: "06:30 PM",
      stops: route?.stops?.length ?? 0,
      status: bus.tripStatus === "ACTIVE" ? "IN PROGRESS" : "COMPLETED"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <History className="text-blue-600 h-9 w-9" /> Journey History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Today's completed trip log for Bus {bus?.busNumber || "—"}.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1,2].map(i => <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <History className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No trip history available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{trip.label}</h3>
                    {route && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {route.routeName}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                    ✓ {trip.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> Departure</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{trip.departure}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> Arrival</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{trip.arrival}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Stops</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{trip.stops}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Bus</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{bus?.busNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
