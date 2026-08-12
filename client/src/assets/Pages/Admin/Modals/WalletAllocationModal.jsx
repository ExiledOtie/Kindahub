import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

import axios from "../../Utils/axios";

const WalletAllocationModal = ({
  deposit,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [groups, setGroups] = useState([]);
  const [loans, setLoans] = useState([]);

  const [allocations, setAllocations] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | FETCH MEMBER ALLOCATION OPTIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);

      const [groupsResponse, loansResponse] =
        await Promise.all([
          axios.get("/groups"),
          axios.get("/loans"),
        ]);

      const groupsData =
        groupsResponse.data?.groups ||
        groupsResponse.data?.data ||
        groupsResponse.data ||
        [];

      const loansData =
        loansResponse.data?.loans ||
        loansResponse.data?.data ||
        loansResponse.data ||
        [];

      /*
      |--------------------------------------------------------------------------
      | GROUPS
      |--------------------------------------------------------------------------
      */

      const memberGroups = Array.isArray(groupsData)
        ? groupsData.filter((group) => {
            /*
             * If the API already returns only the member's groups,
             * keep everything.
             *
             * Otherwise check common user/member fields.
             */

            if (group.user_id) {
              return Number(group.user_id) === Number(deposit.user_id);
            }

            if (group.member_id) {
              return Number(group.member_id) === Number(deposit.user_id);
            }

            return true;
          })
        : [];

      /*
      |--------------------------------------------------------------------------
      | LOANS
      |--------------------------------------------------------------------------
      */

      const memberLoans = Array.isArray(loansData)
        ? loansData.filter(
            (loan) =>
              Number(loan.user_id) ===
                Number(deposit.user_id) &&
              !["paid", "rejected", "cancelled"].includes(
                String(loan.status).toLowerCase()
              ) &&
              Number(loan.balance || 0) > 0
          )
        : [];

      setGroups(memberGroups);
      setLoans(memberLoans);

    } catch (error) {
      console.error(
        "FETCH WALLET ALLOCATION OPTIONS ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to load member groups and loans.",
      });
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ADD ALLOCATION
  |--------------------------------------------------------------------------
  */

  const addAllocation = (type) => {
    setAllocations((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        type,
        amount: "",
        group_id: "",
        loan_id: "",
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE ALLOCATION
  |--------------------------------------------------------------------------
  */

  const removeAllocation = (id) => {
    setAllocations((current) =>
      current.filter((item) => item.id !== id)
    );
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
          : item
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | TOTALS
  |--------------------------------------------------------------------------
  */

  const availableBalance = Number(
    deposit.remaining_balance || 0
  );

  const totalAllocated = useMemo(() => {
    return allocations.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );
  }, [allocations]);

  const remaining = availableBalance - totalAllocated;

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateAllocations = () => {
    if (allocations.length === 0) {
      return "Add at least one allocation.";
    }

    for (const item of allocations) {
      const amount = Number(item.amount || 0);

      if (!Number.isFinite(amount) || amount <= 0) {
        return "Every allocation must have a valid amount.";
      }

      if (item.type === "contribution" && !item.group_id) {
        return "Please select a group for the contribution.";
      }

      if (item.type === "saving" && !item.group_id) {
        return "Please select a group for the saving.";
      }

      if (item.type === "loan_payment" && !item.loan_id) {
        return "Please select a loan for the loan payment.";
      }

      if (
        item.type === "loan_payment"
      ) {
        const selectedLoan = loans.find(
          (loan) =>
            Number(loan.id) ===
            Number(item.loan_id)
        );

        if (
          selectedLoan &&
          amount > Number(selectedLoan.balance || 0)
        ) {
          return `Loan payment cannot exceed the loan balance of KES ${Number(
            selectedLoan.balance
          ).toLocaleString()}.`;
        }
      }
    }

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
    const validationError =
      validateAllocations();

    if (validationError) {
      Swal.fire({
        icon: "warning",
        title: "Check Allocation",
        text: validationError,
      });

      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Confirm Allocation",
      html: `
        <div style="font-size:13px">
          <p>
            Allocate
            <strong>KES ${totalAllocated.toLocaleString()}</strong>
            from
            <strong>${deposit.fullname || "this member"}</strong>'s wallet?
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

      const payload = {
        wallet_deposit_id: deposit.id,
        allocation_mode: "manual",

        allocations: allocations.map(
          (item) => {
            const allocation = {
              type: item.type,
              amount: Number(item.amount),
            };

            if (
              item.type === "contribution" ||
              item.type === "saving"
            ) {
              allocation.group_id = Number(
                item.group_id
              );
            }

            if (
              item.type === "loan_payment"
            ) {
              allocation.loan_id = Number(
                item.loan_id
              );
            }

            return allocation;
          }
        ),
      };

      await axios.post(
        "/wallet-allocations",
        payload
      );

      await Swal.fire({
        icon: "success",
        title: "Allocation Complete",
        text:
          "The wallet amount has been distributed successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      onSuccess?.();
      onClose();

    } catch (error) {
      console.error(
        "WALLET ALLOCATION ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Allocation Failed",
        text:
          error.response?.data?.message ||
          "Failed to allocate wallet funds.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex flex-col items-center gap-3">
            <ClipLoader size={30} />

            <p className="text-xs text-gray-500">
              Loading allocation options...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b px-4 py-3">

          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Allocate Wallet
            </h2>

            <p className="text-[10px] text-gray-500 mt-0.5">
              {deposit.fullname || "Member"}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>

        </div>

        {/* CONTENT */}

        <div className="p-4 space-y-4 overflow-y-auto max-h-[65vh]">

          {/* WALLET SUMMARY */}

          <div className="grid grid-cols-3 gap-2">

            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-[9px] text-gray-400">
                Wallet Balance
              </p>

              <p className="text-sm font-semibold text-blue-600 mt-1">
                KES{" "}
                {availableBalance.toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-[9px] text-gray-400">
                Allocating
              </p>

              <p className="text-sm font-semibold text-green-600 mt-1">
                KES{" "}
                {totalAllocated.toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-[9px] text-gray-400">
                Remaining
              </p>

              <p
                className={`text-sm font-semibold mt-1 ${
                  remaining < 0
                    ? "text-red-600"
                    : "text-gray-800"
                }`}
              >
                KES{" "}
                {remaining.toLocaleString()}
              </p>
            </div>

          </div>

          {/* MEMBER REQUEST */}

          {deposit.notes && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">

              <p className="text-[9px] font-semibold text-blue-600 mb-1">
                MEMBER REQUEST / NOTE
              </p>

              <p className="text-[11px] text-gray-700 whitespace-pre-wrap">
                {deposit.notes}
              </p>

            </div>
          )}

          {/* ADD BUTTONS */}

          <div>

            <p className="text-[10px] font-semibold text-gray-700 mb-2">
              Add Allocation
            </p>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  addAllocation("contribution")
                }
                className="px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-200 text-[10px] hover:bg-green-100"
              >
                + Contribution
              </button>

              <button
                type="button"
                onClick={() =>
                  addAllocation("saving")
                }
                className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] hover:bg-blue-100"
              >
                + Saving
              </button>

              <button
                type="button"
                onClick={() =>
                  addAllocation("loan_payment")
                }
                className="px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] hover:bg-purple-100"
              >
                + Loan Payment
              </button>

            </div>

          </div>

          {/* ALLOCATIONS */}

          <div className="space-y-2">

            {allocations.map(
              (item, index) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3"
                >

                  <div className="flex items-center justify-between mb-2">

                    <p className="text-[10px] font-semibold text-gray-700 capitalize">
                      {index + 1}.{" "}
                      {item.type.replace(
                        "_",
                        " "
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeAllocation(
                          item.id
                        )
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={13} />
                    </button>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                    {/* AMOUNT */}

                    <div>

                      <label className="text-[9px] text-gray-400">
                        Amount
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.amount}
                        onChange={(e) =>
                          updateAllocation(
                            item.id,
                            "amount",
                            e.target.value
                          )
                        }
                        placeholder="Amount"
                        className="w-full border rounded-md px-2 py-1.5 text-[11px] mt-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />

                    </div>

                    {/* GROUP */}

                    {(item.type ===
                      "contribution" ||
                      item.type ===
                        "saving") && (

                      <div>

                        <label className="text-[9px] text-gray-400">
                          Group
                        </label>

                        <select
                          value={
                            item.group_id
                          }
                          onChange={(e) =>
                            updateAllocation(
                              item.id,
                              "group_id",
                              e.target.value
                            )
                          }
                          className="w-full border rounded-md px-2 py-1.5 text-[11px] mt-1"
                        >

                          <option value="">
                            Select group
                          </option>

                          {groups.map(
                            (group) => (
                              <option
                                key={
                                  group.id
                                }
                                value={
                                  group.id
                                }
                              >
                                {group.name ||
                                  group.group_name ||
                                  `Group ${group.id}`}
                              </option>
                            )
                          )}

                        </select>

                      </div>
                    )}

                    {/* LOAN */}

                    {item.type ===
                      "loan_payment" && (

                      <div>

                        <label className="text-[9px] text-gray-400">
                          Loan
                        </label>

                        <select
                          value={
                            item.loan_id
                          }
                          onChange={(e) =>
                            updateAllocation(
                              item.id,
                              "loan_id",
                              e.target.value
                            )
                          }
                          className="w-full border rounded-md px-2 py-1.5 text-[11px] mt-1"
                        >

                          <option value="">
                            Select loan
                          </option>

                          {loans.map(
                            (loan) => (
                              <option
                                key={
                                  loan.id
                                }
                                value={
                                  loan.id
                                }
                              >
                                Loan #
                                {loan.id} — KES{" "}
                                {Number(
                                  loan.balance ||
                                    0
                                ).toLocaleString()}
                              </option>
                            )
                          )}

                        </select>

                      </div>
                    )}

                  </div>

                </div>
              )
            )}

          </div>

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

        </div>

        {/* FOOTER */}

        <div className="border-t px-4 py-3 flex items-center justify-between">

          <div>
            <p className="text-[9px] text-gray-400">
              Remaining wallet balance
            </p>

            <p
              className={`text-xs font-semibold ${
                remaining < 0
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              KES{" "}
              {remaining.toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg text-[10px] border text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                allocations.length === 0 ||
                remaining < 0
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >

              {submitting ? (
                <>
                  <ClipLoader
                    size={11}
                    color="#fff"
                  />
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