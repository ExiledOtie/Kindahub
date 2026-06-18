import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

const UpcomingMeetingCard = ({ meeting }) => {
  if (!meeting) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <p className="text-xs text-gray-500">
          No upcoming meeting scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-emerald-700 mb-3">
        Upcoming Meeting
      </h2>

      <div className="space-y-2 text-xs text-gray-700">
        <p className="flex items-center gap-2">
          <FaCalendarAlt />
          {meeting.announcement_date}
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
      </div>
    </div>
  );
};

export default UpcomingMeetingCard;