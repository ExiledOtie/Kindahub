import React, { useMemo, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

import axios from "../../../Utils/axios";

const WalletAllocationModal = ({ deposit, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const [allocations, setAllocations] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | WALLET BALANCE
  |--------------------------------------------------------------------------
  */

  const availableBalance = Number(deposit?.remaining_balance || 0);

  /*
  |--------------------------------------------------------------------------
  | ADD ALLOCATION
  |--------------------------------------------------------------------------
  |
  | We no longer select a group or loan here.
  |
  | The backend will determine the correct destination
  | and create the appropriate transaction.
  |
  */

  const addAllocation = (type) => {
    setAllocations((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        type,
        amount: "",
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE ALLOCATION
  |--------------------------------------------------------------------------
  */

  const removeAllocation = (id) => {
    setAllocations((current) => current.filter((item) => item.id !== id));
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE ALLOCATION
  |--------------------------------------------------------------------------
  */

  const updateAllocation = (id, field, value) => {
    setAllocations((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | TOTAL ALLOCATED
  |--------------------------------------------------------------------------
  */

  const totalAllocated = useMemo(() => {
    return allocations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [allocations]);

  /*
  |--------------------------------------------------------------------------
  | REMAINING BALANCE
  |--------------------------------------------------------------------------
  */

  const remaining = availableBalance - totalAllocated;

  /*
  |--------------------------------------------------------------------------
  | VALIDATE ALLOCATIONS
  |--------------------------------------------------------------------------
  */

  const validateAllocations = () => {
    if (allocations.length === 0) {
      return "Add at least one allocation.";
    }

    for (const item of allocations) {
      const amount = Number(item.amount || 0);

      /*
      |----------------------------------------------------------------------
      | VALIDATE TYPE
      |----------------------------------------------------------------------
      */

      if (!["contribution", "saving", "loan_payment"].includes(item.type)) {
        return "Invalid allocation type.";
      }

      /*
      |----------------------------------------------------------------------
      | VALIDATE AMOUNT
      |----------------------------------------------------------------------
      */

      if (!Number.isFinite(amount) || amount <= 0) {
        return "Every allocation must have a valid amount greater than zero.";
      }
    }

    /*
    |----------------------------------------------------------------------
    | VALIDATE WALLET BALANCE
    |----------------------------------------------------------------------
    */

    if (totalAllocated > availableBalance) {
      return `Allocation exceeds the available wallet balance of KES ${availableBalance.toLocaleString()}.`;
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT ALLOCATION
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async () => {
    const validationError = validateAllocations();

    if (validationError) {
      Swal.fire({
        icon: "warning",
        title: "Check Allocation",
        text: validationError,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIRM
    |--------------------------------------------------------------------------
    */

    const result = await Swal.fire({
      icon: "question",
      title: "Confirm Allocation",
      html: `
        <div style="font-size:13px">
          <p>
            Allocate
            <strong>KES ${totalAllocated.toLocaleString()}</strong>
            from
            <strong>${deposit?.fullname || "this member"}</strong>'s wallet?
          </p>

          <p style="margin-top:8px">
            Remaining after allocation:
            <strong>KES ${remaining.toLocaleString()}</strong>
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Yes, Allocate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSubmitting(true);

      /*
      |--------------------------------------------------------------------------
      | BUILD PAYLOAD
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      |
      | We deliberately DO NOT send:
      |
      |   group_id
      |   loan_id
      |
      | The backend is responsible for determining the destination.
      |
      */

      const payload = {
        wallet_deposit_id: deposit.id,

        allocation_mode: "manual",

        allocations: allocations.map((item) => ({
          type: item.type,
          amount: Number(item.amount),
        })),
      };

      console.log("WALLET DEPOSIT SELECTED:", deposit);
      console.log("WALLET DEPOSIT ID SENT:", deposit.id);
      console.log("ALLOCATION PAYLOAD:", payload);

      /*
      |--------------------------------------------------------------------------
      | SEND TO BACKEND
      |--------------------------------------------------------------------------
      */

      await axios.post("/wallet-allocations", payload);

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      await Swal.fire({
        icon: "success",
        title: "Allocation Complete",
        text: "The wallet amount has been distributed successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      onSuccess?.();

      onClose();
    } catch (error) {
      console.error("WALLET ALLOCATION ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Allocation Failed",
        text:
          error.response?.data?.message || "Failed to allocate wallet funds.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | GET ALLOCATION LABEL
  |--------------------------------------------------------------------------
  */

  const getAllocationLabel = (type) => {
    switch (type) {
      case "contribution":
        return "Contribution";

      case "saving":
        return "Saving";

      case "loan_payment":
        return "Loan Payment";

      default:
        return type;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | GET ALLOCATION DESCRIPTION
  |--------------------------------------------------------------------------
  */

  const getAllocationDescription = (type) => {
    switch (type) {
      case "contribution":
        return "Money will be recorded as a contribution.";

      case "saving":
        return "Money will be recorded as member savings.";

      case "loan_payment":
        return "Money will be applied to the member's outstanding loan.";

      default:
        return "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* ================================================================
            HEADER
        ================================================================= */}

        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Allocate Wallet
            </h2>

            <p className="text-[10px] text-gray-500 mt-0.5">
              {deposit?.fullname || "Member"}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================================================================
            CONTENT
        ================================================================= */}

        <div className="p-4 space-y-4 overflow-y-auto max-h-[65vh]">
          {/* ==============================================================
              WALLET SUMMARY
          ============================================================== */}

          <div className="grid grid-cols-3 gap-2">
            {/* WALLET */}

            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-[9px] text-gray-400">Wallet Balance</p>

              <p className="text-sm font-semibold text-blue-600 mt-1">
                KES {availableBalance.toLocaleString()}
              </p>
            </div>

            {/* ALLOCATING */}

            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-[9px] text-gray-400">Allocating</p>

              <p className="text-sm font-semibold text-green-600 mt-1">
                KES {totalAllocated.toLocaleString()}
              </p>
            </div>

            {/* REMAINING */}

            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-[9px] text-gray-400">Remaining</p>

              <p
                className={`text-sm font-semibold mt-1 ${
                  remaining < 0 ? "text-red-600" : "text-gray-800"
                }`}
              >
                KES {remaining.toLocaleString()}
              </p>
            </div>
          </div>

          {/* ==============================================================
              MEMBER REQUEST / NOTE
          ============================================================== */}

          {deposit?.notes && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-[9px] font-semibold text-blue-600 mb-1">
                MEMBER REQUEST / NOTE
              </p>

              <p className="text-[11px] text-gray-700 whitespace-pre-wrap">
                {deposit.notes}
              </p>
            </div>
          )}

          {/* ==============================================================
              ADD ALLOCATION
          ============================================================== */}

          <div>
            <p className="text-[10px] font-semibold text-gray-700 mb-2">
              Add Allocation
            </p>

            <div className="flex flex-wrap gap-2">
              {/* CONTRIBUTION */}

              <button
                type="button"
                onClick={() => addAllocation("contribution")}
                disabled={submitting}
                className="px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-200 text-[10px] hover:bg-green-100 disabled:opacity-50"
              >
                + Contribution
              </button>

              {/* SAVING */}

              <button
                type="button"
                onClick={() => addAllocation("saving")}
                disabled={submitting}
                className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] hover:bg-blue-100 disabled:opacity-50"
              >
                + Saving
              </button>

              {/* LOAN PAYMENT */}

              <button
                type="button"
                onClick={() => addAllocation("loan_payment")}
                disabled={submitting}
                className="px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] hover:bg-purple-100 disabled:opacity-50"
              >
                + Loan Payment
              </button>
            </div>
          </div>

          {/* ==============================================================
              ALLOCATIONS
          ============================================================== */}

          <div className="space-y-2">
            {allocations.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-3">
                {/* HEADER */}

                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700">
                      {index + 1}. {getAllocationLabel(item.type)}
                    </p>

                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {getAllocationDescription(item.type)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAllocation(item.id)}
                    disabled={submitting}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* AMOUNT */}

                <div>
                  <label className="text-[9px] text-gray-400">Amount</label>

                  <input
                    type="number"
                    min="1"
                    value={item.amount}
                    onChange={(e) =>
                      updateAllocation(item.id, "amount", e.target.value)
                    }
                    disabled={submitting}
                    placeholder="Enter amount"
                    className="w-full border rounded-md px-2 py-1.5 text-[11px] mt-1 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ==============================================================
              EMPTY STATE
          ============================================================== */}

          {allocations.length === 0 && (
            <div className="border border-dashed rounded-lg p-6 text-center">
              <p className="text-[11px] text-gray-400">
                No allocations added yet.
              </p>

              <p className="text-[9px] text-gray-400 mt-1">
                Add contribution, saving or loan payment above.
              </p>
            </div>
          )}

          {/* ==============================================================
              DESTINATION INFO
          ============================================================== */}

          {allocations.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-[9px] font-semibold text-gray-500 mb-1">
                ALLOCATION DESTINATION
              </p>

              <p className="text-[10px] text-gray-500">
                The system will automatically record each transaction against
                the appropriate member account and use the created transaction
                ID as the wallet allocation reference.
              </p>
            </div>
          )}
        </div>

        {/* ================================================================
            FOOTER
        ================================================================= */}

        <div className="border-t px-4 py-3 flex items-center justify-between">
          {/* BALANCE */}

          <div>
            <p className="text-[9px] text-gray-400">Remaining wallet balance</p>

            <p
              className={`text-xs font-semibold ${
                remaining < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              KES {remaining.toLocaleString()}
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg text-[10px] border text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || allocations.length === 0 || remaining < 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <ClipLoader size={11} color="#fff" />
                  Allocating...
                </>
              ) : (
                <>
                  <Plus size={12} />
                  Allocate Wallet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAllocationModal;
