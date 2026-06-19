import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import NotificationBadge from "./NotificationBadge";
import { getUnreadCount } from "../Services/notificationService";

const NotificationBell = () => {
  const navigate = useNavigate();

  const [count, setCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setCount(data.count || 0);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={() => navigate("/notifications")}
      className="
        relative
        cursor-pointer
        flex
        items-center
        justify-center
      "
    >
      <FaBell
        className={`
          text-lg
          ${count > 0 ? "bell-alert" : ""}
        `}
      />

      <NotificationBadge count={count} />
    </div>
  );
};

export default NotificationBell;