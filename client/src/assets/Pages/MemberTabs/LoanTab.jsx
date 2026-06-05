import { FaPlus, FaMoneyBillWave } from "react-icons/fa";

const LoanTab = ({
  onRequestLoan,
}) => {
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <FaMoneyBillWave />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Loans
              </h2>

              <p className="text-[11px] text-gray-400">
                View and manage member loan applications
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <button
            onClick={onRequestLoan}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-[11px] hover:bg-green-700 transition-all duration-200"
          >
            <FaPlus />
            Request Loan
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="text-center py-10">
          <FaMoneyBillWave className="mx-auto text-4xl text-gray-300 mb-3" />

          <h3 className="text-sm font-semibold text-gray-700">
            No Loan Records
          </h3>

          <p className="text-[11px] text-gray-400 mt-1">
            This member has not applied for any loans yet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanTab;