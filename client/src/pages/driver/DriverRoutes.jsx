import { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';

export default function DriverRoutes() {
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bus className="text-blue-600 h-9 w-9" /> My Route
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Your assigned bus route and stops.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          </div>
        ) : !bus ? (
          <div className="text-center py-20">
            <Bus className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No bus assigned yet.</p>
          </div>
        ) : (
          <>
            {/* Bus summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bus {bus.busNumber}</h2>
                  {route && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{route.routeName}</p>}
                </div>
                <span className="inline-flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                  Scheduled
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Capacity</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{bus.capacity} seats</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Stops</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{route?.stops?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Status</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">Active</p>
                </div>
              </div>
            </div>

            {/* Stops */}
            {route?.stops?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Route Stops</h3>
                <div className="relative">
                  {/* connector line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-3">
                    {route.stops.sort((a, b) => a.order - b.order).map((stop, i) => (
                      <div key={i} className="flex items-center gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 z-10 ${i === 0 || i === route.stops.length - 1 ? "bg-blue-600" : "bg-slate-400 dark:bg-slate-600"}`}>
                          {stop.order}
                        </div>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{stop.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
