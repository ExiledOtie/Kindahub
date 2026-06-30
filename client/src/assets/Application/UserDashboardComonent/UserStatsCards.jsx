import {
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaClock,
} from "react-icons/fa";

const UserStatsCards = ({ dashboard }) => {
  const cards = [
    {
      title: "Savings",
      value: `KES ${Number(
        dashboard?.summary?.totalSavings || 0
      ).toLocaleString()}`,
      icon: <FaPiggyBank />,
      color: "bg-green-500",
    },
    {
      title: "Total Contributions",
      value: `KES ${Number(
        dashboard?.summary?.totalContributions || 0
      ).toLocaleString()}`,
      icon: <FaWallet />,
      color: "bg-blue-500",
    },
    {
      title: "Loan Balance",
      value: `KES ${Number(
        dashboard?.summary?.loanBalance || 0
      ).toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      color: "bg-orange-500",
    },
    {
      title: "Pending Requests",
      value: dashboard?.summary?.pendingRequests || 0,
      icon: <FaClock />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-500">
                {card.title}
              </p>

              <h3 className="mt-1 text-lg font-bold text-gray-800">
                {card.value}
              </h3>
            </div>

            <div
              className={`${card.color} w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg shadow-sm`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStatsCards;