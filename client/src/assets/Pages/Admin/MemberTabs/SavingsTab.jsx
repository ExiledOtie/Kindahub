import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { Plus } from "lucide-react";

import SavingsModal from "../Modals/SavingsModal";

const SavingsTab = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [savings, setSavings] = useState([]);
  const [showModal, setShowModal] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH SAVINGS
  |--------------------------------------------------------------------------
  */

  const fetchSavings = async () => {
    try {
      const res = await axios.get(`/savings/user/${id}`);

      setSavings(res.data);
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load savings",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL SAVINGS
  |--------------------------------------------------------------------------
  */

  const totalSavings = savings
    .filter((item) => item.status === "completed")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  /*
  |--------------------------------------------------------------------------
  | GET PAYMENT REFERENCE
  |--------------------------------------------------------------------------
  |
  | Priority:
  |
  | 1. reference
  | 2. mpesa_code
  | 3. bank_reference
  |
  | Wallet savings will normally not have an M-Pesa or bank reference,
  | so we show "Wallet" where appropriate.
  |
  |--------------------------------------------------------------------------
  */

  const getReference = (saving) => {
    if (saving.reference) {
      return saving.reference;
    }

    if (saving.mpesa_code) {
      return saving.mpesa_code;
    }

    if (saving.bank_reference) {
      return saving.bank_reference;
    }

    if (saving.payment_method === "wallet") {
      return "Wallet";
    }

    return "—";
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <ClipLoader size={28} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[11px] font-semibold text-gray-800">Savings</h2>

          <p className="text-[8px] text-gray-500 mt-0.5">
            Manage member savings
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-md text-[9px]"
        >
          <Plus size={11} />
          Add Savings
        </button>
      </div>

      {/* ================================================================
          STATS
      ================================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* TOTAL SAVINGS */}

        <div className="bg-white border rounded-lg p-2.5">
          <p className="text-[8px] text-gray-500">Total Savings</p>

          <h3 className="text-sm font-semibold text-green-600 mt-0.5">
            KES {Number(totalSavings).toLocaleString()}
          </h3>
        </div>

        {/* TRANSACTIONS */}

        <div className="bg-white border rounded-lg p-2.5">
          <p className="text-[8px] text-gray-500">Transactions</p>

          <h3 className="text-sm font-semibold text-blue-600 mt-0.5">
            {savings.length}
          </h3>
        </div>

        {/* LATEST SAVING */}

        <div className="bg-white border rounded-lg p-2.5">
          <p className="text-[8px] text-gray-500">Latest Saving</p>

          <h3 className="text-sm font-semibold text-purple-600 mt-0.5">
            {savings[0]
              ? `KES ${Number(savings[0].amount).toLocaleString()}`
              : "KES 0"}
          </h3>
        </div>
      </div>

      {/* ================================================================
          TABLE
      ================================================================= */}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-2.5 py-1.5 text-left font-semibold">#</th>

                <th className="px-2.5 py-1.5 text-left font-semibold">Date</th>

                <th className="px-2.5 py-1.5 text-left font-semibold">
                  Amount
                </th>

                <th className="px-2.5 py-1.5 text-left font-semibold">
                  Method
                </th>

                <th className="px-2.5 py-1.5 text-left font-semibold">
                  Reference
                </th>

                <th className="px-2.5 py-1.5 text-left font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {savings.length > 0 ? (
                savings.map((saving, index) => (
                  <tr
                    key={saving.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    {/* NUMBER */}

                    <td className="px-2.5 py-1.5 text-gray-500">{index + 1}</td>

                    {/* DATE */}

                    <td className="px-2.5 py-1.5 whitespace-nowrap">
                      {saving.created_at
                        ? new Date(saving.created_at).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* AMOUNT */}

                    <td className="px-2.5 py-1.5 font-medium whitespace-nowrap">
                      KES {Number(saving.amount || 0).toLocaleString()}
                    </td>

                    {/* METHOD */}

                    <td className="px-2.5 py-1.5 capitalize">
                      {saving.payment_method || "—"}
                    </td>

                    {/* REFERENCE */}

                    <td
                      className="px-2.5 py-1.5 max-w-[140px] truncate"
                      title={getReference(saving)}
                    >
                      {getReference(saving)}
                    </td>

                    {/* STATUS */}

                    <td className="px-2.5 py-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium uppercase
                        ${
                          saving.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : saving.status === "rejected"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {saving.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-5 text-[9px] text-gray-500"
                  >
                    No savings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================
          SAVINGS MODAL
      ================================================================= */}

      <SavingsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        userId={id}
        onSuccess={fetchSavings}
      />
    </div>
  );
};

export default SavingsTab;
