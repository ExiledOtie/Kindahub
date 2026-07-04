
import { ClipLoader } from "react-spinners";

const Announcement = ({ announcements = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
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
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Date
              </th>

              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Type
              </th>

              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Venue
              </th>

              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Time
              </th>
            </tr>
          </thead>

          <tbody>
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <tr
                  key={announcement.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(
                      announcement.announcement_date
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium capitalize">
                      {announcement.type}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {announcement.venue || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {announcement.meeting_time || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="py-10 text-center text-gray-500"
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