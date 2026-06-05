import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FaMoneyBillWave } from "react-icons/fa";

import axios from "../Utils/axios";

const Contributions = () => {
  const [loading, setLoading] =
    useState(true);

  const [contributions, setContributions] =
    useState([]);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions =
    async () => {
      try {
        setLoading(true);

        const res =
          await axios.get(
            "/contributions"
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

  const formatCurrency =
    (amount) => {
      return Number(
        amount || 0
      ).toLocaleString();
    };

  const formatDate =
    (date) => {
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

  const totalAmount =
    contributions.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount || 0
        ),
      0
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
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

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <FaMoneyBillWave />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Contributions
            </h2>

            <p className="text-[11px] text-gray-400">
              View all member contributions
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] text-gray-500">
            Total Contributions
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-1">
            {contributions.length}
          </h3>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] text-gray-500">
            Total Amount
          </p>

          <h3 className="text-xl font-bold text-green-600 mt-1">
            KES{" "}
            {formatCurrency(
              totalAmount
            )}
          </h3>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  Member
                </th>

                <th className="px-4 py-3 text-left">
                  Group
                </th>

                <th className="px-4 py-3 text-left">
                  Amount
                </th>

                <th className="px-4 py-3 text-left">
                  Method
                </th>

                <th className="px-4 py-3 text-left">
                  MPESA Code
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {contributions.length >
              0 ? (
                contributions.map(
                  (
                    contribution
                  ) => (
                    <tr
                      key={
                        contribution.id
                      }
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {
                          contribution.fullname
                        }
                      </td>

                      <td className="px-4 py-3">
                        {
                          contribution.group_name
                        }
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
                        {contribution.mpesa_code ||
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                          {
                            contribution.status
                          }
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {formatDate(
                          contribution.created_at
                        )}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
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
    </div>
  );
};

export default Contributions;