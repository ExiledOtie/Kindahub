import React from "react";
import {
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

const AnnouncementCard = ({ announcement }) => {
  return (
    <div className="flex justify-between items-center border border-emerald-100 rounded-lg px-4 py-3 hover:bg-emerald-50 transition">

      <div>
        <h3 className="text-sm font-semibold text-gray-800">
          {announcement.title}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          {announcement.venue}
        </p>
      </div>

      <div className="text-right">

        <div className="flex items-center justify-end gap-2 text-xs text-gray-600">
          <FaCalendarAlt />
          {new Date(
            announcement.announcement_date
          ).toLocaleDateString()}
        </div>

        <div className="flex items-center justify-end gap-2 text-xs text-gray-600 mt-1">
          <FaClock />
          {announcement.meeting_time}
        </div>

        <span className="inline-block mt-2 px-2 py-1 rounded-full bg-emerald-600 text-white text-[10px]">
          Scheduled
        </span>

      </div>

    </div>
  );
};

export default AnnouncementCard;