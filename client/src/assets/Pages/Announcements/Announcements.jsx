import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { FaPlus } from "react-icons/fa";

import api from "../../Utils/axios";

import AnnouncementCard from "./Components/AnnouncementCard";
import UpcomingMeetingCard from "./Components/UpcomingMeetingCard";
import AnnouncementModal from "./Components/AnnouncementModal";

const Announcements = () => {
  const [groups, setGroups] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [announcements, setAnnouncements] = useState([]);

  const [upcomingMeeting, setUpcomingMeeting] = useState(null);

  const [openModal, setOpenModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

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
  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");

      setGroups(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const announcementDate = new Date(item.announcement_date).toDateString();

    return announcementDate === selectedDate.toDateString();
  });

  return (
    <div className="p-3 md:p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm md:text-lg font-semibold">Announcements</h1>

        {(user?.role === "super_admin" || user?.is_super_admin) && (
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg"
          >
            <FaPlus />
            Add
          </button>
        )}
      </div>

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* CALENDAR */}
        <div className="bg-white rounded-xl shadow-sm p-3">
          <Calendar value={selectedDate} onChange={setSelectedDate} />
        </div>

        {/* UPCOMING */}
        <div className="lg:col-span-2">
          <UpcomingMeetingCard meeting={upcomingMeeting} />
        </div>
      </div>

      {/* ANNOUNCEMENTS */}
      <div className="bg-white rounded-xl shadow-sm p-3">
        <h2 className="text-sm font-semibold mb-3">
          Announcements for {selectedDate.toLocaleDateString()}
        </h2>

        {filteredAnnouncements.length === 0 ? (
          <div className="text-xs text-gray-500 py-6 text-center">
            No announcements found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
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
