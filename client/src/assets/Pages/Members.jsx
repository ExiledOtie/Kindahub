import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import axios from "../Utils/axios";
import MemberModal from "./Modals/MemberModal";

const Members = () => {
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showMemberModal, setShowMemberModal] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH MEMBERS
  |--------------------------------------------------------------------------
  */
  const fetchMembers = async () => {
    try {
      const res = await axios.get("/users");
      setMembers(res.data);
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load members",
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH GROUPS
  |--------------------------------------------------------------------------
  */
  const fetchGroups = async () => {
    try {
      const res = await axios.get("/groups");
      setGroups(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchMembers(), fetchGroups()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTER MEMBERS
  |--------------------------------------------------------------------------
  */
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      member.phone?.includes(search) ||
      member.username?.toLowerCase().includes(search.toLowerCase());

    const matchesGroup =
      groupFilter === "all" || member.group_name === groupFilter;

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  /*
  |--------------------------------------------------------------------------
  | BADGES
  |--------------------------------------------------------------------------
  */
  const getStatusBadge = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };
  
  const getGroupBadge = (groupName) => {
    switch (groupName) {
      case "Kinda Family":
        return "bg-blue-100 text-blue-700";

      case "13 Amigos":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Members</h1>

          <p className="text-xs text-gray-500 mt-1">Manage SACCO members</p>
        </div>

        <button
          onClick={() => setShowMemberModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-medium"
        >
          <Plus size={14} />
          Add Member
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-xs"
          >
            <option value="all">All Groups</option>

            {groups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-xs"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Username</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Group</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/members/${member.id}`}
                        className="text-green-600 font-medium hover:text-green-700"
                      >
                        {member.fullname}
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {member.username}
                    </td>

                    <td className="px-4 py-3 text-gray-600">{member.phone}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${getGroupBadge(
                          member.group_name,
                        )}`}
                      >
                        {member.group_name || "No Group"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStatusBadge(
                          member.status,
                        )}`}
                      >
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-8 text-gray-500 text-xs"
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
          Showing {filteredMembers.length} member(s)
        </div>
      </div>

      {/* MODAL */}
      <MemberModal
        open={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        groups={groups}
        onSuccess={fetchMembers}
      />
    </div>
  );
};

export default Members;
