import { useEffect, useState } from "react";
import { getStudentNotices } from "../../services/studentApi";
import { Bell, Inbox } from "lucide-react";

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentNotices()
      .then((data) => {
        setNotices(data.notices || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          Loading notices...
        </div>
      </div>
    );
  }

  if (!notices.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">No announcements yet</p>
        <p className="text-slate-400 text-sm mt-1">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notices.map((notice, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-4"
        >
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 text-sm break-words">
                {notice.title}
              </h4>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                {notice.message}
              </p>
              {notice.createdAt && (
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
