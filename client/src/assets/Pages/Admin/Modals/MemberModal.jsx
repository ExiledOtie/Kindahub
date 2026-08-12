import React, { useState } from "react";
import Swal from "sweetalert2";
import { X } from "lucide-react";
import axios from "../../../Utils/axios";

const MemberModal = ({ open, onClose, groups = [], onSuccess }) => {
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    group_id: "",
  });
  console.log("GROUPS:", groups);
  if (!open) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      fullname: "",
      email: "",
      phone: "",
      password: "",
      group_id: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);

      const selectedGroup = groups.find(
        (g) => Number(g.id) === Number(formData.group_id),
      );

      await axios.post("/users/create", {
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "member",
        group_id: formData.group_id,
        group_name: selectedGroup?.name,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Member created successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      resetForm();
      onClose();

      if (onSuccess) onSuccess();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to create member",
      });
    } finally {
      setCreating(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-sm font-semibold">Register New Member</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* FULL NAME */}
          <div>
            <label className="block text-xs mb-1 font-medium">Full Name</label>

            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-xs mb-1 font-medium">Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-xs mb-1 font-medium">
              Phone Number
            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs mb-1 font-medium">Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* GROUP */}
          <div>
            <label className="block text-xs mb-1 font-medium">Group</label>

            <select
              name="group_id"
              value={formData.group_id}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">
                {groups.length === 0 ? "No groups available" : "Select Group"}
              </option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs"
            >
              {creating ? "Creating..." : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberModal;
