import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { getUnreadCount } from "../Services/notificationService";

const NotificationBell = () => {
  const [count, setCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setCount(data.count || 0);
    } catch (error) {
      console.error("Notification count error:", error);
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
    <div className="relative flex items-center">
      <FaBell
        className={`
          text-[11px]
          ${count > 0 ? "bell-alert" : ""}
        `}
      />

      {count > 0 && (
        <span
          className="
            absolute
            -top-2
            -right-2
            min-w-[18px]
            h-[18px]
            rounded-full
            bg-red-500
            text-white
            text-[9px]
            flex
            items-center
            justify-center
            font-bold
          "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;