import { useEffect, useState } from "react";
import api from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LiveControl from "../../components/driver/LiveControl";
import LiveBusMap from "../../components/student/LiveBusMap";
import { MapPin, Bus, Users, Phone, Award, Navigation } from "lucide-react";

export default function DriverDashboard() {
  const { socket, isConnected } = useSocket();
  const [driver, setDriver] = useState(null);
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnDuty, setIsOnDuty] = useState(false);

  useEffect(() => {
    api.get("/drivers/dashboard").then((res) => {
      setDriver(res.data.driver);
      setBus(res.data.bus);
      if (res.data.bus?.routeId) {
        setRoute(res.data.bus.routeId);
      }
      
      // Generate today's trips from route data
      if (res.data.bus?.route) {
        const todayTrips = [
          {
            id: 1,
            name: `Morning Trip - ${res.data.bus.route.startPoint} to ${res.data.bus.route.endPoint}`,
            departure: "07:00 AM",
            arrival: "08:30 AM",
            stops: res.data.bus.route.stops?.length || 8,
            capacity: res.data.bus.capacity,
            booked: Math.floor(Math.random() * 20) + 25,
            status: "Scheduled"
          },
          {
            id: 2,
            name: `Evening Trip - ${res.data.bus.route.endPoint} to ${res.data.bus.route.startPoint}`,
            departure: "05:00 PM",
            arrival: "06:30 PM",
            stops: res.data.bus.route.stops?.length || 8,
            capacity: res.data.bus.capacity,
            booked: Math.floor(Math.random() * 20) + 20,
            status: "Scheduled"
          }
        ];
        setTrips(todayTrips);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!driver || !bus) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">No driver or bus data found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* =======================
          HEADER SECTION
      ======================= */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Driver Dashboard 🚌</h1>
          <p className="text-slate-600 mt-1">Today's trips and bus information</p>
        </div>
        <button
          onClick={() => setIsOnDuty(!isOnDuty)}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            isOnDuty 
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isOnDuty ? "🔴 On Duty" : "⚪ Off Duty"}
        </button>
      </div>

      {/* =======================
          TOP STATS CARDS
      ======================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Bus Number</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{bus.busNumber}</h3>
            </div>
            <Bus className="w-8 h-8 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Today's Trips</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{trips.length}</h3>
            </div>
            <Navigation className="w-8 h-8 text-green-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Capacity</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{bus.capacity} Seats</h3>
            </div>
            <Users className="w-8 h-8 text-purple-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Status</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{isOnDuty ? "Active" : "Idle"}</h3>
            </div>
            <Award className="w-8 h-8 text-orange-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* =======================
          TODAY'S TRIPS
      ======================= */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Today's Scheduled Trips</h2>
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{trip.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {trip.departure} - {trip.arrival} ({trip.stops} stops)
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  trip.status === 'Scheduled' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {trip.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Capacity</p>
                  <p className="text-lg font-bold text-slate-900">{trip.capacity}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Booked</p>
                  <p className="text-lg font-bold text-blue-600">{trip.booked}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Available</p>
                  <p className="text-lg font-bold text-green-600">{trip.capacity - trip.booked}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =======================
          DRIVER INFO & LIVE CONTROL
      ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Driver Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Your Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-slate-600 text-sm font-medium">Name</p>
              <p className="text-slate-900 font-semibold text-lg">{driver.name}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">Phone</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-slate-600" />
                <p className="text-slate-900">{driver.phone}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">License Number</p>
              <div className="flex items-center gap-2 mt-1">
                <Award className="w-4 h-4 text-slate-600" />
                <p className="text-slate-900 font-mono">{driver.licenseNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Location Sharing */}
        <LiveControl busId={bus._id} />
      </div>

      {/* =======================
          MAP SECTION
      ======================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Live Map & Route</h2>
        <div className="bg-slate-100 rounded-lg overflow-hidden" style={{ height: "400px" }}>
          <LiveBusMap busId={bus._id} isDriver={true} />
        </div>
      </div>

      {/* =======================
          ROUTE DETAILS
      ======================= */}
      {route && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Route Stops</h2>
          <div className="space-y-3">
            {route.stops && route.stops.length > 0 ? (
              route.stops
                .sort((a, b) => a.order - b.order)
                .map((stop, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">
                      {stop.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900">{stop.name}</h4>
                      {stop.lat && stop.lng && (
                        <p className="text-xs text-slate-600 mt-1">
                          📍 {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-slate-500 text-center py-8">No stops configured for this route</p>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
