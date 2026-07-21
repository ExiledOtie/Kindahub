import { useMemo } from "react";
import {
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaCoins,
  FaBalanceScale,
  FaWallet,
} from "react-icons/fa";

const LoanStats = ({ loans = [], interestEarned = 0 }) => {
  const stats = useMemo(() => {
    const totalLoans = loans.length;

    const pendingLoans = loans.filter(
      (loan) => loan.status === "pending",
    ).length;

    const approvedLoans = loans.filter(
      (loan) => loan.status === "approved",
    ).length;

    const repaidLoans = loans.filter((loan) => loan.status === "repaid").length;

    const outstandingBalance = loans
      .filter((loan) => loan.status === "approved")
      .reduce((sum, loan) => sum + Number(loan.balance || 0), 0);
      
    return {
      totalLoans,
      pendingLoans,
      approvedLoans,
      repaidLoans,
      outstandingBalance,
      interestEarned: Number(interestEarned),
    };
  }, [loans]);

  const cards = [
    {
      title: "Total Loans",
      value: stats.totalLoans,
      icon: FaMoneyBillWave,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "Pending Loans",
      value: stats.pendingLoans,
      icon: FaClock,
      bg: "bg-yellow-50",
      color: "text-yellow-600",
    },
    {
      title: "Approved Loans",
      value: stats.approvedLoans,
      icon: FaCheckCircle,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      title: "Repaid Loans",
      value: stats.repaidLoans,
      icon: FaCoins,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      title: "Outstanding Balance",
      value: `KES ${stats.outstandingBalance.toLocaleString()}`,
      icon: FaBalanceScale,
      bg: "bg-red-50",
      color: "text-red-600",
    },
    {
      title: "Interest Earned",
      value: `KES ${stats.interestEarned.toLocaleString()}`,
      icon: FaWallet,
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-gray-500 truncate">
                  {card.title}
                </p>

                <h3 className="text-sm font-bold text-gray-800 mt-1 break-words">
                  {card.value}
                </h3>
              </div>

              <div
                className={`ml-2 h-8 w-8 rounded-full flex items-center justify-center ${card.bg}`}
              >
                <Icon className={`${card.color} text-sm`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LoanStats;
