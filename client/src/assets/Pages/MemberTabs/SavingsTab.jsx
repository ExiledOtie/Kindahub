import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../Utils/axios";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ClipLoader size={35} color="#16a34a" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[10px] font-semibold text-gray-800">Savings</h2>

          <p className="text-[9px] text-gray-500">Manage member savings</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px]"
        >
          <Plus size={12} />
          Add Savings
        </button>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] text-gray-500">Total Savings</p>

          <h3 className="text-lg font-semibold text-green-600 mt-1">
            KES {Number(totalSavings).toLocaleString()}
          </h3>
        </div>

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] text-gray-500">Transactions</p>

          <h3 className="text-lg font-semibold text-blue-600 mt-1">
            {savings.length}
          </h3>
        </div>

        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] text-gray-500">Latest Saving</p>

          <h3 className="text-lg font-semibold text-purple-600 mt-1">
            {savings[0]
              ? `KES ${Number(savings[0].amount).toLocaleString()}`
              : "KES 0"}
          </h3>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">#</th>

                <th className="px-3 py-2 text-left font-semibold">Date</th>

                <th className="px-3 py-2 text-left font-semibold">Amount</th>

                <th className="px-3 py-2 text-left font-semibold">Method</th>

                <th className="px-3 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {savings.length > 0 ? (
                savings.map((saving, index) => (
                  <tr key={saving.id} className="border-b">
                    <td className="px-3 py-2">{index + 1}</td>

                    <td className="px-3 py-2">
                      {new Date(saving.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-3 py-2 font-medium">
                      KES {Number(saving.amount).toLocaleString()}
                    </td>

                    <td className="px-3 py-2">{saving.payment_method}</td>

                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-medium
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
                  <td colSpan="5" className="text-center py-6 text-[10px] text-gray-500">
                    No savings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
