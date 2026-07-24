import { useEffect, useState } from "react";
import axios from "../../Utils/axios";
import Swal from "sweetalert2";

const SavingsModal = ({ open, onClose, userId, onSuccess }) => {
  const [groups, setGroups] = useState([]);

  const [formData, setFormData] = useState({
    group_id: "",
    amount: "",
    payment_method: "cash",
    mpesa_code: "",
    bank_reference: "",
  });

  /*
  |--------------------------------------------------------------------------
  | FETCH GROUPS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get("/groups");

      setGroups(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/savings", {
        user_id: userId,
        group_id: formData.group_id,
        amount: formData.amount,
        payment_method: formData.payment_method,
        mpesa_code:
          formData.payment_method === "mpesa" ? formData.mpesa_code : null,

        bank_reference:
          formData.payment_method === "bank" ? formData.bank_reference : null,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Savings added successfully",
      });

      onSuccess();

      onClose();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add savings",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-5">
        <h2 className="text-sm font-semibold mb-4">Add Savings</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            required
            value={formData.group_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                group_id: e.target.value,
              })
            }
            className="w-full border rounded-lg p-2 text-sm"
          >
            <option value="">Select Group</option>

            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            required
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: e.target.value,
              })
            }
            className="w-full border rounded-lg p-2 text-sm"
          />

          <select
            value={formData.payment_method}
            onChange={(e) =>
              setFormData({
                ...formData,
                payment_method: e.target.value,
              })
            }
            className="w-full border rounded-lg p-2 text-sm"
          >
            <option value="cash">Cash</option>

            <option value="mpesa">Mpesa</option>

            <option value="bank">Bank</option>
          </select>

          {formData.payment_method === "mpesa" && (
            <input
              type="text"
              placeholder="Mpesa Code"
              value={formData.mpesa_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mpesa_code: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2 text-sm"
            />
          )}

          {formData.payment_method === "bank" && (
            <input
              type="text"
              placeholder="Bank Reference"
              value={formData.bank_reference}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bank_reference: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2 text-sm"
            />
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsModal;
