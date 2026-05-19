import { useEffect, useState } from "react";
import axios from "../../Utils/axios";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";

import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaEdit,
} from "react-icons/fa";

const ProfileTab = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users/me");

      setUser(res.data);
      setName(res.data.name || "");
      setEmail(res.data.email || "");
      setPhone(res.data.phone || "");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put("/users/me", {
        name,
        email,
        phone,
        password: password || undefined,
      });

      setUser(res.data);
      setPassword("");

      Swal.fire("Success", "Profile updated successfully", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update profile", "error");
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaUserCircle className="text-4xl text-gray-400" />

          <div>
            <h2 className="text-sm font-semibold text-gray-800">{user.name}</h2>
            <p className="text-[11px] text-gray-500">#{user.id}</p>
          </div>
        </div>

        <button className="flex items-center gap-2 text-blue-600 text-[12px] border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
          <FaEdit />
          Edit
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <FaUser className="text-purple-500" />
          <div>
            <p className="text-[10px] text-gray-400">Name</p>
            <p className="text-sm font-semibold">{user.name}</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <FaEnvelope className="text-blue-500" />
          <div>
            <p className="text-[10px] text-gray-400">Email</p>
            <p className="text-sm font-semibold">{user.email}</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <FaPhone className="text-green-500" />
          <div>
            <p className="text-[10px] text-gray-400">Phone</p>
            <p className="text-sm font-semibold">{user.phone || "Not set"}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3 text-[12px]">
        {["overview", "security", "activity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === tab
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3 text-[12px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Role</span>
            <span className="text-gray-700 font-medium">{user.role}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className="text-green-600 font-medium">{user.state}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Created</span>
            <span>{formatDate(user.created_at)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Last Login</span>
            <span>{formatDate(user.last_login)}</span>
          </div>
        </div>
      )}

      {/* SECURITY */}
      {activeTab === "security" && (
        <form
          onSubmit={handleUpdate}
          className="bg-white border rounded-xl p-4 shadow-sm space-y-4 text-[12px]"
        >
          <input
            className="w-full border p-2 rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />

          <input
            className="w-full border p-2 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            className="w-full border p-2 rounded-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
          />

          <input
            type="password"
            className="w-full border p-2 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (optional)"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Update Profile
          </button>
        </form>
      )}

      {/* ACTIVITY */}
      {activeTab === "activity" && (
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3 text-[12px]">
          <div className="flex items-center gap-2 text-gray-600">
            <FaClock />
            <span>Updated profile</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <FaClock />
            <span>Logged in</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
