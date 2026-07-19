import { useMemo } from "react";

import {
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaCoins,
  FaBalanceScale,
  FaWallet,
} from "react-icons/fa";

const LoanStats = ({ loans = [] }) => {
  const stats = useMemo(() => {
    const totalLoans = loans.length;

    const pendingLoans = loans.filter(
      (loan) => loan.status === "pending"
    ).length;

    const approvedLoans = loans.filter(
      (loan) => loan.status === "approved"
    ).length;

    const repaidLoans = loans.filter(
      (loan) => loan.status === "repaid"
    ).length;

    const outstandingBalance = loans
      .filter((loan) => loan.status === "approved")
      .reduce(
        (sum, loan) => sum + Number(loan.balance || 0),
        0
      );

    const interestEarned = loans.reduce((sum, loan) => {
      return (
        sum +
        Number(loan.amount || 0) *
          Number(loan.interest_rate || 0) /
          100
      );
    }, 0);

    return {
      totalLoans,
      pendingLoans,
      approvedLoans,
      repaidLoans,
      outstandingBalance,
      interestEarned,
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
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white border rounded-xl p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] text-gray-500">
                  {card.title}
                </p>

                <h3 className="text-lg font-bold mt-1">
                  {card.value}
                </h3>
              </div>

              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${card.bg}`}
              >
                <Icon className={`${card.color} text-lg`} />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LoanStats;