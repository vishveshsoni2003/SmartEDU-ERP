import { useEffect, useState } from "react";
import { getAllHostels, deleteHostel } from "../../services/adminApi";

export default function HostelList() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchHostels = () => {
    getAllHostels()
      .then((data) => {
        setHostels(data.hostels || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleDelete = async (hostelId, hostelName) => {
    if (!window.confirm(`Are you sure you want to delete "${hostelName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(hostelId);
    try {
      await deleteHostel(hostelId);
      setHostels(hostels.filter((h) => h._id !== hostelId));
      alert("Hostel deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete hostel");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p className="text-slate-500">Loading hostels...</p>;
  if (!hostels.length)
    return <p className="text-slate-500">No hostels found</p>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Hostels</h3>

      <div className="space-y-3">
        {hostels.map((h) => (
          <div
            key={h._id}
            className="p-3 rounded-lg bg-slate-50 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-slate-900">
                {h.name} ({h.type})
              </p>
              <p className="text-sm text-slate-600">
                Rooms: {h.totalRooms}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                Occupied: {h.occupiedRooms || 0}
              </span>
              <button
                onClick={() => handleDelete(h._id, h.name)}
                disabled={deleting === h._id}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting === h._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
