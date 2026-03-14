import { useEffect, useState } from "react";
import api from "../../services/api";
import { Calendar, MapPin } from "lucide-react";

export default function UpcomingHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/holidays")
      .then((res) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter holidays that are coming up (from today onwards)
        const upcoming = (res.data.holidays || []).filter(h => {
          const holidayDate = new Date(h.date);
          return holidayDate >= today;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setHolidays(upcoming);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          Loading holidays...
        </div>
      </div>
    );
  }

  if (!holidays.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">No holidays coming up</p>
        <p className="text-slate-400 text-sm mt-1">Enjoy your regular schedule!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {holidays.slice(0, 5).map((holiday, i) => {
        const holidayDate = new Date(holiday.date);

        return (
          <div
            key={i}
            className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200 hover:border-red-300 hover:shadow-md transition-all duration-200 p-4"
          >
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-red-600 mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 text-sm wrap-break-word">
                  {holiday.title}
                </h4>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-slate-700">
                    <span className="font-medium">
                      {holidayDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Type: <span className="font-medium capitalize">{holiday.type?.toLowerCase() || 'Holiday'}</span>
                  </p>
                </div>
              </div>
              <div className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
                1 day
              </div>
            </div>
          </div>
        );
      })}
      {holidays.length > 5 && (
        <p className="text-xs text-slate-500 text-center pt-2">
          +{holidays.length - 5} more upcoming
        </p>
      )}
    </div>
  );
}
