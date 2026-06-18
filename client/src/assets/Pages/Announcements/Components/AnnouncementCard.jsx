import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

const AnnouncementCard = ({ announcement }) => {
  const meetingDate = new Date(
    announcement.announcement_date
  );

  const isCompleted =
    meetingDate < new Date();

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        isCompleted
          ? "bg-gray-100 border-gray-300"
          : "bg-green-50 border-green-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          {announcement.title}
        </h3>

        <span
          className={`px-2 py-1 rounded-full text-[10px] font-medium ${
            isCompleted
              ? "bg-gray-500 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {isCompleted
            ? "Completed"
            : "Scheduled"}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-3">
        {announcement.description}
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
        <p className="flex items-center gap-2">
          <FaCalendarAlt />
          {new Date(
            announcement.announcement_date
          ).toLocaleDateString()}
        </p>

        <p className="flex items-center gap-2">
          <FaClock />
          {announcement.meeting_time}
        </p>

        <p className="flex items-center gap-2">
          <FaMapMarkerAlt />
          {announcement.venue}
        </p>

        <p className="flex items-center gap-2">
          <FaUser />
          {announcement.host}
        </p>
      </div>

      {announcement.group_name && (
        <div className="mt-3 pt-3 border-t text-[11px] text-gray-500">
          Group: {announcement.group_name}
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;