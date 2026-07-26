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
    (item) => item.status === "pending",
  ).length;

  const approvedCount = contributions.filter(
    (item) => item.status === "completed",
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-sm font-semibold text-gray-800">
            My Contributions
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Contributions remain pending until approved by an administrator.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs"
        >
          <Plus size={14} />
          Add Contribution
        </button>
      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Approved</p>

          <h2 className="text-lg font-bold text-green-700 mt-2">
            KES {formatCurrency(totalAmount)}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Pending Verification</p>

          <h2 className="text-lg font-bold text-orange-600 mt-2">
            {pendingCount}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Approved Contributions</p>

          <h2 className="text-lg font-bold text-blue-600 mt-2">
            {approvedCount}
          </h2>
        </div>
      </div>

      {/* Table */}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-2 py-2 text-left">#</th>

                <th className="px-2 py-2 text-left">Date</th>

                <th className="px-2 py-2 text-left">Amount</th>

                <th className="px-2 py-2 text-left">Reference</th>

                <th className="px-2 py-2 text-left">Method</th>

                <th className="px-2 py-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {contributions.length > 0 ? (
                contributions.map((contribution, index) => (
                  <tr
                    key={contribution.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-3">{index + 1}</td>

                    <td className="px-2 py-3">
                      {formatDate(contribution.created_at)}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      KES {formatCurrency(contribution.amount)}
                    </td>

                    <td className="px-2 py-2">
                      {c.payment_method === "mpesa"
                        ? c.mpesa_code || "-"
                        : c.payment_method === "bank"
                          ? c.bank_reference || "-"
                          : "-"}
                    </td>

                    <td className="px-4 py-3 capitalize">
                      {contribution.payment_method}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${
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
                  <td colSpan="6" className="text-center py-10 text-gray-500">
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
