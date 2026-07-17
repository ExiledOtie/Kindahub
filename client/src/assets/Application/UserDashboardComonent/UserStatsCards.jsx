import {
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaPercentage,
  FaBalanceScale,
} from "react-icons/fa";

const UserStatsCards = ({ dashboard }) => {

  const cards = [
    {
      title: "Savings",
      value: `KES ${Number(
        dashboard?.mySavings || 0
      ).toLocaleString()}`,
      icon: <FaPiggyBank />,
      color: "bg-green-500",
    },

    {
      title: "Total Contributions",
      value: `KES ${Number(
        dashboard?.myContributions || 0
      ).toLocaleString()}`,
      icon: <FaWallet />,
      color: "bg-blue-500",
    },

    {
      title: "Active Loan",
      value: `KES ${Number(
        dashboard?.activeLoanAmount || 0
      ).toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      color: "bg-orange-500",
    },

    {
      title: "Loan Balance",
      value: `KES ${Number(
        dashboard?.loanBalanceRemaining || 0
      ).toLocaleString()}`,
      icon: <FaBalanceScale />,
      color: "bg-red-500",
    },

    {
      title: "Interest Paid",
      value: `KES ${Number(
        dashboard?.totalInterestPaid || 0
      ).toLocaleString()}`,
      icon: <FaPercentage />,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border p-3 shadow-sm"
        >
          <div className="flex justify-between items-center">

            <div>
              <p className="text-[10px] text-gray-500">
                {card.title}
              </p>

              <h3 className="text-sm font-bold mt-1">
                {card.value}
              </h3>
            </div>

            <div
              className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}
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