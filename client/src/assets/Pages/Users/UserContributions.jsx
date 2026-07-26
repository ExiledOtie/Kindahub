import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { Plus } from "lucide-react";

import axios from "../../Utils/axios";
import UserContributionModal from "./Modals/UserContributionModal";

const UserContributions = () => {
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/contributions/my");

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

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalAmount = contributions
    .filter((item) => item.status === "completed")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const pendingCount = contributions.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = contributions.filter(
    (item) => item.status === "completed"
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ClipLoader size={28} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-3 text-[9px]">
      {/* Header */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[11px] font-semibold text-gray-800">
            My Contributions
          </h1>

          <p className="text-[9px] text-gray-500 mt-0.5">
            Contributions remain pending until approved by an administrator.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 h-8 bg-green-600 hover:bg-green-700 text-white px-3 rounded-md text-[9px]"
        >
          <Plus size={12} />
          Add Contribution
        </button>
      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-white border rounded-md p-2.5 shadow-sm">
          <p className="text-[8px] uppercase tracking-wide text-gray-500">
            Total Approved
          </p>

          <h2 className="text-[11px] font-bold text-green-700 mt-1">
            KES {formatCurrency(totalAmount)}
          </h2>
        </div>

        <div className="bg-white border rounded-md p-2.5 shadow-sm">
          <p className="text-[8px] uppercase tracking-wide text-gray-500">
            Pending Verification
          </p>

          <h2 className="text-[11px] font-bold text-orange-600 mt-1">
            {pendingCount}
          </h2>
        </div>

        <div className="bg-white border rounded-md p-2.5 shadow-sm">
          <p className="text-[8px] uppercase tracking-wide text-gray-500">
            Approved Contributions
          </p>

          <h2 className="text-[11px] font-bold text-blue-600 mt-1">
            {approvedCount}
          </h2>
        </div>
      </div>

      {/* Table */}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-600">
                <th className="px-2 py-1.5 text-left">#</th>

                <th className="px-2 py-1.5 text-left">Date</th>

                <th className="px-2 py-1.5 text-left">Amount</th>

                <th className="px-2 py-1.5 text-left">Reference</th>

                <th className="px-2 py-1.5 text-left">Method</th>

                <th className="px-2 py-1.5 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {contributions.length > 0 ? (
                contributions.map((contribution, index) => (
                  <tr
                    key={contribution.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 py-1.5">
                      {index + 1}
                    </td>

                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {formatDate(contribution.created_at)}
                    </td>

                    <td className="px-2 py-1.5 font-semibold text-green-700 whitespace-nowrap">
                      KES {formatCurrency(contribution.amount)}
                    </td>

                    <td className="px-2 py-1.5">
                      {contribution.payment_method === "mpesa"
                        ? contribution.mpesa_code || "-"
                        : contribution.payment_method === "bank"
                        ? contribution.bank_reference || "-"
                        : "-"}
                    </td>

                    <td className="px-2 py-1.5 capitalize">
                      {contribution.payment_method}
                    </td>

                    <td className="px-2 py-1.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-medium ${
                          contribution.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : contribution.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
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

      <UserContributionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchContributions}
      />
    </div>
  );
};

export default UserContributions;