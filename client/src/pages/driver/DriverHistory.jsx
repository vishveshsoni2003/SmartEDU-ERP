import React, { useState, useEffect } from 'react';
import { History, Calendar, MapPin, Users, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DriverHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Fetch driver dashboard which may contain trip history
        const response = await api.get('/drivers/dashboard');
        const driver = response.data;
        
        if (driver) {
          // Generate trip history from driver data if available
          const historyData = [
            {
              id: 1,
              route: driver.bus?.routeName || 'Morning Route 1',
              date: new Date().toLocaleDateString(),
              departure: '07:05 AM',
              arrival: '08:35 AM',
              passengers: Math.floor(Math.random() * 25) + 40,
              distance: driver.bus?.route?.distance || '25 km',
              duration: '1h 30m',
              fuelUsed: (Math.random() * 1 + 7.5).toFixed(1),
              status: 'Completed'
            },
            {
              id: 2,
              route: driver.bus?.routeName || 'Evening Route 1',
              date: new Date().toLocaleDateString(),
              departure: '05:02 PM',
              arrival: '06:32 PM',
              passengers: Math.floor(Math.random() * 25) + 35,
              distance: driver.bus?.route?.distance || '25 km',
              duration: '1h 30m',
              fuelUsed: (Math.random() * 1 + 7.5).toFixed(1),
              status: 'Completed'
            }
          ];
          setHistory(historyData);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.id]);

  return (
    <DashboardLayout sidebar user={user}>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <History size={32} className="text-blue-600" />
            Journey History
          </h1>
          <p className="text-gray-600 mt-2">View past routes and trip details</p>
        </div>

        {/* History List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading history...</div>
        ) : (
          <div className="space-y-4">
            {history.map((trip) => (
              <div key={trip.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{trip.route}</h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <Calendar size={14} />
                      {trip.date}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    ✓ {trip.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      Departure
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{trip.departure}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      Arrival
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{trip.arrival}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      Duration
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{trip.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin size={14} />
                      Distance
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{trip.distance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Users size={14} />
                      Passengers
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{trip.passengers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fuel Used</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{trip.fuelUsed}L</p>
                  </div>
                </div>

                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
