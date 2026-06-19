const NotificationBadge = ({ count }) => {
  if (!count || count < 1) return null;

  return (
    <span
      className="
        absolute
        -top-2
        -right-2
        min-w-[18px]
        h-[18px]
        px-1
        rounded-full
        bg-red-500
        text-white
        text-[10px]
        flex
        items-center
        justify-center
        font-bold
      "
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default NotificationBadge;