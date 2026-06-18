import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaUsers,
} from "react-icons/fa";

const UpcomingMeetingCard = ({ meeting }) => {
  if (!meeting) {
    return (
      <div className="bg-white rounded-xl border p-5 h-full flex items-center justify-center">
        <p className="text-sm text-gray-500">
          No upcoming meeting scheduled.
        </p>
      </div>
    );
  }

  const meetingDate = new Date(
    meeting.announcement_date
  );

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (meetingDate - new Date()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl p-5 shadow-sm h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs opacity-80">
            NEXT MEETING
          </p>

          <h2 className="text-xl font-bold">
            {meeting.title}
          </h2>
        </div>

        <div className="bg-white/20 px-3 py-2 rounded-lg text-center">
          <p className="text-[10px]">
            DAYS LEFT
          </p>

          <p className="text-lg font-bold">
            {daysRemaining}
          </p>
        </div>
      </div>

      <p className="text-sm opacity-90 mb-4">
        {meeting.description}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <p className="flex items-center gap-2">
          <FaCalendarAlt />
          {meetingDate.toLocaleDateString()}
        </p>

        <p className="flex items-center gap-2">
          <FaClock />
          {meeting.meeting_time}
        </p>

        <p className="flex items-center gap-2">
          <FaMapMarkerAlt />
          {meeting.venue}
        </p>

        <p className="flex items-center gap-2">
          <FaUser />
          {meeting.host}
        </p>

        {meeting.group_name && (
          <p className="flex items-center gap-2 col-span-2">
            <FaUsers />
            {meeting.group_name}
          </p>
        )}
      </div>
    </div>
  );
};

export default UpcomingMeetingCard;