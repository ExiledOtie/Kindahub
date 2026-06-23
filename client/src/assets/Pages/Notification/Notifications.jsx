import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import NotificationCard from "./Components/NotificationCard";
import EmptyNotifications from "./Components/EmptyNotifications";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "./Services/notificationService";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load notifications", "error");
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
      <div className="p-4 text-sm">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">
          Notifications
        </h1>

        <button
          onClick={handleReadAll}
          className="
            bg-blue-600
            text-white
            px-3
            py-1.5
            rounded
            text-xs
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

export default Notifications;