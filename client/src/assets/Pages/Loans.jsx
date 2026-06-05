import { useEffect, useState } from "react";
import axios from "../Utils/axios";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaMoneyBillWave,
} from "react-icons/fa";

const Loans = () => {
  const [loans, setLoans] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchLoans =
    async () => {
      try {
        const res =
          await axios.get(
            "/loans"
          );

        setLoans(res.data);

      } catch (error) {
        console.log(error);

        Swal.fire(
          "Error",
          "Failed to fetch loans",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchLoans();
  }, []);

  const approveLoan =
    async (id) => {
      try {
        await axios.patch(
          `/loans/${id}/approve`
        );

        Swal.fire(
          "Success",
          "Loan approved",
          "success"
        );

        fetchLoans();

      } catch (error) {
        console.log(error);

        Swal.fire(
          "Error",
          "Failed to approve loan",
          "error"
        );
      }
    };

  const rejectLoan =
    async (id) => {
      try {
        await axios.patch(
          `/loans/${id}/reject`
        );

        Swal.fire(
          "Success",
          "Loan rejected",
          "success"
        );

        fetchLoans();

      } catch (error) {
        console.log(error);

        Swal.fire(
          "Error",
          "Failed to reject loan",
          "error"
        );
      }
    };

  const deleteLoan =
    async (id) => {
      const result =
        await Swal.fire({
          title:
            "Delete Loan?",
          text:
            "This action cannot be undone",
          icon: "warning",
          showCancelButton: true,
        });

      if (!result.isConfirmed)
        return;

      try {
        await axios.delete(
          `/loans/${id}`
        );

        Swal.fire(
          "Deleted",
          "Loan deleted",
          "success"
        );

        fetchLoans();

      } catch (error) {
        console.log(error);

        Swal.fire(
          "Error",
          "Failed to delete loan",
          "error"
        );
      }
    };

  const getStatusClass =
    (status) => {
      switch (status) {
        case "approved":
          return "bg-green-100 text-green-600";

        case "rejected":
          return "bg-red-100 text-red-600";

        default:
          return "bg-yellow-100 text-yellow-600";
      }
    };

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
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <FaMoneyBillWave />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Loans
            </h2>

            <p className="text-[11px] text-gray-400">
              Manage loan applications
            </p>
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-50 border-b">
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
                  Interest
                </th>

                <th className="px-4 py-3 text-left">
                  Duration
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loans.length > 0 ? (
                loans.map(
                  (loan) => (
                    <tr
                      key={loan.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {loan.fullname}
                      </td>

                      <td className="px-4 py-3">
                        {
                          loan.group_name
                        }
                      </td>

                      <td className="px-4 py-3">
                        KES{" "}
                        {Number(
                          loan.amount
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        {
                          loan.interest_rate
                        }
                        %
                      </td>

                      <td className="px-4 py-3">
                        {
                          loan.duration_months
                        }{" "}
                        Months
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStatusClass(
                            loan.status
                          )}`}
                        >
                          {
                            loan.status
                          }
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {loan.status ===
                            "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  approveLoan(
                                    loan.id
                                  )
                                }
                                className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"
                              >
                                <FaCheck />
                              </button>

                              <button
                                onClick={() =>
                                  rejectLoan(
                                    loan.id
                                  )
                                }
                                className="h-8 w-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() =>
                              deleteLoan(
                                loan.id
                              )
                            }
                            className="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-8 text-gray-400"
                  >
                    No loans found
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

export default Loans;