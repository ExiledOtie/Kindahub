import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { Plus } from "lucide-react";

import axios from "../../Utils/axios";
import UserSavingsModal from "./Modals/UserSavingsModal";

const ITEMS_PER_PAGE = 10;

const UserSavings = () => {
  const [loading, setLoading] = useState(true);
  const [savings, setSavings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/savings/my");

      setSavings(res.data || []);
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

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const totalApproved = savings
    .filter((item) => item.status === "completed")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const pendingCount = savings.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = savings.filter(
    (item) => item.status === "completed"
  ).length;

  const totalPages = Math.ceil(savings.length / ITEMS_PER_PAGE);

  const paginatedSavings = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return savings.slice(start, start + ITEMS_PER_PAGE);
  }, [savings, page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ClipLoader size={28} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-3 text-[9px]">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-[11px] font-semibold text-gray-800">
            My Savings
          </h1>

          <p className="text-[9px] text-gray-500 mt-0.5">
            Submit and track your savings
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 h-8 bg-green-600 hover:bg-green-700 text-white px-3 rounded-md text-[9px]"
        >
          <Plus size={12} />
          Add Saving
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

        <div className="bg-white border rounded-md shadow-sm p-2.5">
          <p className="text-[8px] uppercase tracking-wide text-gray-500">
            Total Approved
          </p>

          <h2 className="mt-1 text-[11px] font-bold text-green-600">
            KES {formatCurrency(totalApproved)}
          </h2>
        </div>

        <div className="bg-white border rounded-md shadow-sm p-2.5">
          <p className="text-[8px] uppercase tracking-wide text-gray-500">
            Pending Verification
          </p>

          <h2 className="mt-1 text-[11px] font-bold text-orange-600">
            {pendingCount}
          </h2>
        </div>

        <div className="bg-white border rounded-md shadow-sm p-2.5">
          <p className="text-[8px] uppercase tracking-wide text-gray-500">
            Approved Savings
          </p>

          <h2 className="mt-1 text-[11px] font-bold text-blue-600">
            {approvedCount}
          </h2>
        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-[9px]">

            <thead className="bg-gray-50 border-b">

              <tr className="text-gray-600">

                <th className="px-2 py-1.5 text-left">
                  #
                </th>

                <th className="px-2 py-1.5 text-left">
                  Date
                </th>

                <th className="px-2 py-1.5 text-left">
                  Amount
                </th>

                <th className="px-2 py-1.5 text-left">
                  Reference
                </th>

                <th className="px-2 py-1.5 text-left">
                  Method
                </th>

                <th className="px-2 py-1.5 text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedSavings.length > 0 ? (
                paginatedSavings.map((saving, index) => (
                  <tr
                    key={saving.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >

                    <td className="px-2 py-1.5">
                      {(page - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>

                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {formatDate(saving.created_at)}
                    </td>

                    <td className="px-2 py-1.5 font-semibold text-green-700 whitespace-nowrap">
                      KES {formatCurrency(saving.amount)}
                    </td>

                    <td className="px-2 py-1.5">
                      {saving.payment_method === "mpesa"
                        ? saving.mpesa_code || "-"
                        : saving.payment_method === "bank"
                        ? saving.bank_reference || "-"
                        : "-"}
                    </td>

                    <td className="px-2 py-1.5 capitalize">
                      {saving.payment_method}
                    </td>

                    <td className="px-2 py-1.5">

                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-medium ${
                          saving.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : saving.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
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
                    className="py-8 text-center text-[9px] text-gray-500"
                  >
                    No savings found
                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}

        {totalPages > 1 && (

          <div className="flex justify-between items-center border-t px-3 py-2 text-[9px]">

            <span>
              Page {page} of {totalPages}
            </span>

            <div className="flex gap-2">

              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-7 px-3 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="h-7 px-3 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>

            </div>

          </div>

        )}

      </div>

      <UserSavingsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchSavings}
      />

    </div>
  );
};

export default UserSavings;