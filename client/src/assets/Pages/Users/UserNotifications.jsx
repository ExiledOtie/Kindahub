import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import NotificationCard from "../Notification/Components/NotificationCard";
import EmptyNotifications from "../Notification/Components/EmptyNotifications";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../Notification/Services/notificationService";

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        "Failed to load notifications",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true }
            : n
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-xs">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="p-4">

      <div className="flex items-center justify-between mb-4">

        <h1 className="text-sm font-semibold">
          My Notifications
        </h1>

        <button
          onClick={handleReadAll}
          className="
            bg-emerald-600
            hover:bg-emerald-700
            text-white
            px-3
            py-1.5
            rounded
            text-[11px]
          "
        >
          Mark All Read
        </button>

      </div>

      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={handleRead}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default UserNotifications;