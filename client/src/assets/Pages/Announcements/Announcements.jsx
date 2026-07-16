import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";

import api from "../../Utils/axios";

import UpcomingMeetingCard from "./Components/UpcomingMeetingCard";
import AnnouncementModal from "./Components/AnnouncementModal";

const Announcements = () => {
  const [groups, setGroups] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [announcements, setAnnouncements] = useState([]);
  const [upcomingMeeting, setUpcomingMeeting] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    fetchAnnouncements();
    fetchUpcomingMeeting();
    fetchGroups();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUpcomingMeeting = async () => {
    try {
      const res = await api.get("/announcements/upcoming");
      setUpcomingMeeting(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateAnnouncement = async (formData) => {
    try {
      await api.post("/announcements", formData);

      fetchAnnouncements();
      fetchUpcomingMeeting();

      setOpenModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAnnouncements = announcements.filter(
    (a) => new Date(a.announcement_date) >= today,
  );

  const historyAnnouncements = announcements.filter(
    (a) => new Date(a.announcement_date) < today,
  );

  return (
    <div className="p-3 md:p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm md:text-lg font-semibold">Announcements</h1>

        {(user?.role === "super_admin" || user?.is_super_admin) && (
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs"
          >
            <FaPlus />
            Add
          </button>
        )}
      </div>

      {/* CALENDAR + NEXT MEETING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl shadow-sm p-3">
          <Calendar value={selectedDate} onChange={setSelectedDate} />
        </div>

        <div className="lg:col-span-2">
          <UpcomingMeetingCard meeting={upcomingMeeting} />
        </div>
      </div>

      {/* UPCOMING MEETINGS */}
      <div className="bg-white rounded-xl shadow-sm mb-5">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-sm font-semibold">Upcoming Meetings</h2>

          <span className="text-xs text-gray-500">
            {upcomingAnnouncements.length} meeting(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-3">Date</th>

                <th className="text-left py-3 px-3">Title</th>

                <th className="text-left py-3 px-3">Group</th>

                <th className="text-left py-3 px-3">Venue</th>

                <th className="text-left py-3 px-3">Time</th>

                <th className="text-center py-3 px-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {upcomingAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No upcoming meetings.
                  </td>
                </tr>
              ) : (
                upcomingAnnouncements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-3">
                      {new Date(
                        announcement.announcement_date,
                      ).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3 font-medium">
                      {announcement.title}
                    </td>
                    <td className="py-3 px-3">
                      {announcement.group_name || "-"}
                    </td>

                    <td className="py-3 px-3">{announcement.venue}</td>

                    <td className="py-3 px-3">{announcement.meeting_time}</td>

                    <td className="text-center py-3 px-3">
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">
                        Scheduled
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HISTORY */}
      <div className="bg-white rounded-xl shadow-sm">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex justify-between items-center p-4"
        >
          <span className="text-sm font-semibold">Meeting History</span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {historyAnnouncements.length}
            </span>

            {showHistory ? (
              <FaChevronUp size={12} />
            ) : (
              <FaChevronDown size={12} />
            )}
          </div>
        </button>

        {showHistory && (
          <div className="overflow-x-auto border-t">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-3">Date</th>

                  <th className="text-left py-3 px-3">Title</th>

                  <th className="text-left py-3 px-3">Group</th>

                  <th className="text-left py-3 px-3">Venue</th>

                  <th className="text-center py-3 px-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {historyAnnouncements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No completed meetings.
                    </td>
                  </tr>
                ) : (
                  historyAnnouncements.map((announcement) => (
                    <tr key={announcement.id} className="border-b">
                      <td className="py-3 px-3">
                        {new Date(
                          announcement.announcement_date,
                        ).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3 font-medium">
                        {announcement.title}
                      </td>

                      <td className="py-3 px-3">
                        {announcement.group_name || "-"}
                      </td>

                      <td className="py-3 px-3">{announcement.venue}</td>

                      <td className="text-center py-3 px-3">
                        <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-[10px]">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}

      <AnnouncementModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateAnnouncement}
        groups={groups}
      />
    </div>
  );
};

export default Announcements;
