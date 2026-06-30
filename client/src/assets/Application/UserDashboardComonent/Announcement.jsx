import { useEffect, useState } from "react";
import axios from "../../Utils/axios";
import { ClipLoader } from "react-spinners";

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const res = await axios.get("/announcements");

      setAnnouncements(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements(true);

    const interval = setInterval(() => {
      fetchAnnouncements(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-center">
        <ClipLoader size={25} color="#059669" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-semibold text-gray-800">
          Upcoming Announcements
        </h2>

        <p className="text-[11px] text-gray-500 mt-1">
          Meetings and important notices
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Date
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Type
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Venue
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Time
              </th>
            </tr>
          </thead>

          <tbody>
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <tr
                  key={announcement.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    {new Date(
                      announcement.date
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium">
                      {announcement.type}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {announcement.venue}
                  </td>

                  <td className="px-4 py-3">
                    {announcement.time}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-8 text-gray-500"
                >
                  No announcements available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Announcement;