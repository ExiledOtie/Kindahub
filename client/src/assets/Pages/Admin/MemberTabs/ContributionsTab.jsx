import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

import axios from "../../../Utils/axios";
import ContributionModal from "../Modals/ContributionModal";

const ContributionsTab = ({ memberId }) => {
  const [loading, setLoading] = useState(true);

  const [contributions, setContributions] = useState([]);

  const [showModal, setShowModal] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH CONTRIBUTIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (memberId) {
      fetchContributions();
    }
  }, [memberId]);

  const fetchContributions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/contributions/user/${memberId}`);

      setContributions(res.data || []);
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load contributions",
      });
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT CURRENCY
  |--------------------------------------------------------------------------
  */

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString();
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | GET REFERENCE
  |--------------------------------------------------------------------------
  |
  | Priority:
  |
  | 1. M-Pesa Code
  | 2. Bank Reference
  | 3. Dash
  |
  |--------------------------------------------------------------------------
  */

  const getReference = (contribution) => {
    return contribution.mpesa_code || contribution.bank_reference || "—";
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ClipLoader size={30} color="#16a34a" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-3">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[11px] font-semibold text-gray-800">
            Contributions
          </h1>

          <p className="text-[9px] text-gray-500 mt-0.5">
            Member contribution history
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[9px]"
        >
          <Plus size={12} />
          Add Contribution
        </button>
      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">#</th>

                <th className="px-3 py-2 text-left font-semibold">Date</th>

                <th className="px-3 py-2 text-left font-semibold">Amount</th>

                <th className="px-3 py-2 text-left font-semibold">Method</th>

                <th className="px-3 py-2 text-left font-semibold">Reference</th>

                <th className="px-3 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {contributions.length > 0 ? (
                contributions.map((contribution, index) => (
                  <tr
                    key={contribution.id}
                    className="border-b hover:bg-gray-50"
                  >
                    {/* NUMBER */}

                    <td className="px-3 py-2">{index + 1}</td>

                    {/* DATE */}

                    <td className="px-3 py-2">
                      {formatDate(contribution.created_at)}
                    </td>

                    {/* AMOUNT */}

                    <td className="px-3 py-2 font-medium">
                      KES {formatCurrency(contribution.amount)}
                    </td>

                    {/* METHOD */}

                    <td className="px-3 py-2 capitalize">
                      {contribution.payment_method}
                    </td>

                    {/* REFERENCE */}

                    <td className="px-3 py-2 font-mono text-[8px] text-gray-600">
                      {getReference(contribution)}
                    </td>

                    {/* STATUS */}

                    <td className="px-3 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                          contribution.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : contribution.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {contribution.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-[9px] text-gray-500"
                  >
                    No contributions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}

      <ContributionModal
        open={showModal}
        memberId={memberId}
        onClose={() => setShowModal(false)}
        onSuccess={fetchContributions}
      />
    </div>
  );
};

export default ContributionsTab;
