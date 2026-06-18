import React from "react";

const AnnouncementCard = ({ announcement }) => {
  return (
    <div className="bg-white border rounded-lg p-3 hover:shadow-sm transition">
      <h3 className="text-sm font-semibold text-gray-800">
        {announcement.title}
      </h3>

      <p className="text-xs text-gray-500 mt-1">
        {announcement.announcement_date}
      </p>

      <p className="text-xs text-gray-700 mt-2">
        {announcement.description}
      </p>
    </div>
  );
};

export default AnnouncementCard;