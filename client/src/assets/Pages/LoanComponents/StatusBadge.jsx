const colors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  repaid: "bg-blue-100 text-blue-700",
};

const labels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  repaid: "Repaid",
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;