import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DriverRoutes() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        // Fetch driver dashboard with assigned routes
        const response = await api.get('/drivers/dashboard');
        const bus = response.data?.bus;
        
        if (bus && bus.route) {
          const routesData = [{
            id: bus._id,
            name: bus.routeName || `Route ${bus.number}`,
            startPoint: bus.route.startPoint || 'Central Station',
            endPoint: bus.route.endPoint || 'Campus Main Gate',
            departure: '07:00 AM',
            arrival: '08:30 AM',
            stops: bus.route.stops?.length || 8,
            passengers: bus.currentPassengers || Math.floor(Math.random() * 30) + 20,
            distance: bus.route.distance || '25 km',
            status: 'Scheduled'
          }];
          setRoutes(routesData);
        }
      } catch (err) {
        console.error('Error fetching routes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [user.id]);

  return (
    <DashboardLayout sidebar user={user}>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bus size={32} className="text-blue-600" />
            My Routes
          </h1>
          <p className="text-gray-600 mt-2">View and manage your assigned bus routes</p>
        </div>

        {/* Routes List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading routes...</div>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                        {route.status}
                      </span>
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Start Route
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">From</p>
                      <p className="text-sm font-medium text-gray-900">{route.startPoint}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">To</p>
                      <p className="text-sm font-medium text-gray-900">{route.endPoint}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Departure</p>
                      <p className="text-sm font-medium text-gray-900">{route.departure}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Arrival</p>
                      <p className="text-sm font-medium text-gray-900">{route.arrival}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Distance</p>
                      <p className="text-lg font-semibold text-gray-900">{route.distance}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Stops</p>
                      <p className="text-lg font-semibold text-gray-900">{route.stops}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Users size={14} />
                        Passengers
                      </p>
                      <p className="text-lg font-semibold text-gray-900">{route.passengers}</p>
                    </div>
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
