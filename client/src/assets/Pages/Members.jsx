import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";

const Members = () => {
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [groupFilter, setGroupFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const members = [
    {
      id: 1,
      memberNo: "MBR001",
      name: "John Doe",
      phone: "0712345678",
      group: "Savings",
      status: "Active",
      joined: "12 Jan 2025",
    },

    {
      id: 2,
      memberNo: "MBR002",
      name: "Mary Wanjiku",
      phone: "0722345678",
      group: "Merry-Go-Round",
      status: "Active",
      joined: "18 Jan 2025",
    },

    {
      id: 3,
      memberNo: "MBR003",
      name: "James Otieno",
      phone: "0700111222",
      group: "Investment",
      status: "Inactive",
      joined: "25 Jan 2025",
    },

    {
      id: 4,
      memberNo: "MBR004",
      name: "Ann Njeri",
      phone: "0715678910",
      group: "Savings",
      status: "Active",
      joined: "01 Feb 2025",
    },
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search);

    const matchesGroup = groupFilter === "all" || member.group === groupFilter;

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  const getGroupBadge = (group) => {
    switch (group) {
      case "Savings":
        return "bg-green-100 text-green-700";

      case "Merry-Go-Round":
        return "bg-purple-100 text-purple-700";

      case "Investment":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadge = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Members</h1>

          <p className="text-xs text-gray-500 mt-1">Manage SACCO members</p>
        </div>

        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition">
          <Plus size={14} />
          Add Member
        </button>
      </div>

      {/* Filters */}

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

            <option value="Savings">Savings</option>

            <option value="Merry-Go-Round">Merry-Go-Round</option>

            <option value="Investment">Investment</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-xs"
          >
            <option value="all">All Status</option>

            <option value="Active">Active</option>

            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Name
                </th>

                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Member No
                </th>

                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Phone
                </th>

                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Group
                </th>

                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Status
                </th>

                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/members/${member.id}`}
                        className="text-green-600 hover:text-green-700 font-medium text-xs"
                      >
                        {member.name}
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {member.memberNo}
                    </td>

                    <td className="px-4 py-3 text-gray-600">{member.phone}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${getGroupBadge(
                          member.group,
                        )}`}
                      >
                        {member.group}
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

                    <td className="px-4 py-3 text-gray-600">{member.joined}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
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
    </div>
  );
};

export default Members;
