const Statements = () => {
  const [showContributions, setShowContributions] = useState(false);

  const [showSavings, setShowSavings] = useState(false);

  const [showLoans, setShowLoans] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-4">
        <h2 className="text-sm font-semibold">Statements</h2>

        <p className="text-[11px] text-gray-500 mt-1">
          View your contribution, savings and loan history.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowContributions(true)}
          className="bg-white border rounded-xl p-4 text-left hover:border-green-500"
        >
          <h3 className="text-sm font-semibold">Contributions Statement</h3>

          <p className="text-[10px] text-gray-500 mt-1">
            View all contribution records.
          </p>
        </button>

        <button
          onClick={() => setShowSavings(true)}
          className="bg-white border rounded-xl p-4 text-left hover:border-green-500"
        >
          <h3 className="text-sm font-semibold">Savings Statement</h3>

          <p className="text-[10px] text-gray-500 mt-1">
            View all savings transactions.
          </p>
        </button>

        <button
          onClick={() => setShowLoans(true)}
          className="bg-white border rounded-xl p-4 text-left hover:border-green-500"
        >
          <h3 className="text-sm font-semibold">Loan Payments Statement</h3>

          <p className="text-[10px] text-gray-500 mt-1">
            View all loan repayment history.
          </p>
        </button>
      </div>

      <ContributionsStatementModal
        open={showContributions}
        onClose={() => setShowContributions(false)}
      />

      <SavingsStatementModal
        open={showSavings}
        onClose={() => setShowSavings(false)}
      />

      <LoanPaymentsStatementModal
        open={showLoans}
        onClose={() => setShowLoans(false)}
      />
    </div>
  );
};

export default Statements;
