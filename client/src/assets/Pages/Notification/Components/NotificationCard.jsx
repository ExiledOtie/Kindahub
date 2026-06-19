import {
  FaBell,
  FaBullhorn,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const NotificationCard = ({
  notification,
  onRead,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "announcement":
        return <FaBullhorn />;

      case "meeting":
      case "meeting_reminder":
        return <FaCalendarAlt />;

      case "loan_approved":
        return <FaCheckCircle />;

      case "loan_rejected":
        return <FaTimesCircle />;

      case "contribution":
        return <FaMoneyBillWave />;

      default:
        return <FaBell />;
    }
  };

  return (
    <div
      onClick={() => onRead(notification.id)}
      className={`
        p-4
        rounded-lg
        shadow-sm
        border
        cursor-pointer
        transition
        hover:shadow-md
        ${
          !notification.is_read
            ? "bg-blue-50 border-blue-300"
            : "bg-white"
        }
      `}
    >
      <div className="flex gap-3">
        <div className="text-xl">
          {getIcon()}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">
            {notification.title}
          </h3>

          <p className="text-sm text-gray-600">
            {notification.message}
          </p>

          <small className="text-gray-400">
            {new Date(
              notification.created_at
            ).toLocaleString()}
          </small>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;