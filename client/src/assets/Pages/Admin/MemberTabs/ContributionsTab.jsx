import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

import axios from "../../../Utils/axios";
import ContributionModal from "../Modals/ContributionModal";

const ContributionsTab = ({ memberId }) => {
  const [loading, setLoading] =
    useState(true);

  const [contributions, setContributions] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  useEffect(() => {
    if (memberId) {
      fetchContributions();
    }
  }, [memberId]);

  const fetchContributions =
    async () => {
      try {
        setLoading(true);

        const res =
          await axios.get(
            `/contributions/user/${memberId}`
          );

        setContributions(
          res.data || []
        );

      } catch (error) {
        console.log(error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            "Failed to load contributions",
        });

      } finally {
        setLoading(false);
      }
    };

  const formatCurrency = (
    amount
  ) => {
    return Number(
      amount || 0
    ).toLocaleString();
  };

  const formatDate = (
    date
  ) => {
    return new Date(
      date
    ).toLocaleDateString(
      "en-KE",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ClipLoader
          size={35}
          color="#16a34a"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-sm font-semibold text-gray-800">
            Contributions
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Member contribution history
          </p>
        </div>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs"
        >
          <Plus size={14} />
          Add Contribution
        </button>
      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-xs">

            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  #
                </th>

                <th className="px-4 py-3 text-left">
                  Date
                </th>

                <th className="px-4 py-3 text-left">
                  Amount
                </th>

                <th className="px-4 py-3 text-left">
                  Method
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {contributions.length >
              0 ? (
                contributions.map(
                  (
                    contribution,
                    index
                  ) => (
                    <tr
                      key={
                        contribution.id
                      }
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        {formatDate(
                          contribution.created_at
                        )}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        KES{" "}
                        {formatCurrency(
                          contribution.amount
                        )}
                      </td>

                      <td className="px-4 py-3 capitalize">
                        {
                          contribution.payment_method
                        }
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                            contribution.status ===
                            "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {
                            contribution.status
                          }
                        </span>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-gray-500"
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
        onClose={() =>
          setShowModal(false)
        }
        onSuccess={
          fetchContributions
        }
      />

    </div>
  );
};

export default ContributionsTab;