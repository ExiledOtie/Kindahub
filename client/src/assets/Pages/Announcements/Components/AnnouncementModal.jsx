import React, { useState } from "react";

const AnnouncementModal = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    announcement_date: "",
    meeting_time: "",
    venue: "",
    host: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);

    setFormData({
      title: "",
      description: "",
      announcement_date: "",
      meeting_time: "",
      venue: "",
      host: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <h2 className="text-sm font-semibold mb-4">
          Add Announcement
        </h2>

        <div className="space-y-3">
          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          />

          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          />

          <input
            type="date"
            name="announcement_date"
            value={formData.announcement_date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          />

          <input
            name="meeting_time"
            placeholder="Meeting Time"
            value={formData.meeting_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          />

          <input
            name="venue"
            placeholder="Venue"
            value={formData.venue}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          />

          <input
            name="host"
            placeholder="Host"
            value={formData.host}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-3 py-2 text-xs bg-emerald-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;