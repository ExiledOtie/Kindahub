import React, { useState, useEffect } from "react";

const AnnouncementModal = ({ open, onClose, onSubmit, groups = [] }) => {
  const [formData, setFormData] = useState({
    group_id: "",
    title: "",
    description: "",
    announcement_date: "",
    meeting_time: "",
    venue: "",
    host: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        group_id: "",
        title: "",
        description: "",
        announcement_date: "",
        meeting_time: "",
        venue: "",
        host: "",
      });
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.group_id) {
      alert("Please select a group");
      return;
    }

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!formData.announcement_date) {
      alert("Please select a date");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <h2 className="text-sm font-semibold mb-4">Add Announcement</h2>

        <div className="space-y-3">
          <select
            name="group_id"
            value={formData.group_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          >
            <option value="">Select Group</option>

            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          />

          <textarea
            name="description"
            rows={3}
            placeholder="Description"
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
            type="text"
            name="meeting_time"
            placeholder="Meeting Time"
            value={formData.meeting_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          />

          <input
            type="text"
            name="venue"
            placeholder="Venue"
            value={formData.venue}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-xs"
          />

          <input
            type="text"
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
            className="px-3 py-2 border rounded text-xs"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-3 py-2 bg-emerald-600 text-white rounded text-xs"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
