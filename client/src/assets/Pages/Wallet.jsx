import React, { useEffect, useMemo, useState } from "react";
import {
  Wallet as WalletIcon,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Plus,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

import axios from "../Utils/axios";

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deposits, setDeposits] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [processingId, setProcessingId] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH WALLET DEPOSITS
  |--------------------------------------------------------------------------
  */

  const fetchWalletDeposits = async () => {
    try {
      const response = await axios.get("/wallet-deposits");

      const data =
        response.data?.deposits ||
        response.data?.data ||
        response.data ||
        [];

      setDeposits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH WALLET DEPOSITS ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to load wallet deposits.",
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const load = async () => {
      try {
        await fetchWalletDeposits();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchWalletDeposits();
    } finally {
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VERIFY DEPOSIT
  |--------------------------------------------------------------------------
  */

  const handleVerify = async (deposit) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Verify Deposit?",
      text: `Verify KES ${Number(
        deposit.amount || 0
      ).toLocaleString()} wallet deposit from ${
        deposit.fullname || "member"
      }?`,
      showCancelButton: true,
      confirmButtonText: "Yes, Verify",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
    });

    if (!result.isConfirmed) return;

    setProcessingId(deposit.id);

    try {
      await axios.patch(
        `/wallet-deposits/${deposit.id}/verify`
      );

      Swal.fire({
        icon: "success",
        title: "Verified",
        text: "Wallet deposit verified successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      await fetchWalletDeposits();
    } catch (error) {
      console.error("VERIFY WALLET DEPOSIT ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text:
          error.response?.data?.message ||
          "Failed to verify wallet deposit.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REJECT DEPOSIT
  |--------------------------------------------------------------------------
  */

  const handleReject = async (deposit) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Reject Deposit?",
      text: `Reject KES ${Number(
        deposit.amount || 0
      ).toLocaleString()} wallet deposit from ${
        deposit.fullname || "member"
      }?`,
      input: "textarea",
      inputPlaceholder: "Optional rejection reason...",
      showCancelButton: true,
      confirmButtonText: "Reject Deposit",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    setProcessingId(deposit.id);

    try {
      await axios.patch(
        `/wallet-deposits/${deposit.id}/reject`,
        {
          notes: result.value || null,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Deposit Rejected",
        text: "Wallet deposit has been rejected.",
        timer: 1800,
        showConfirmButton: false,
      });

      await fetchWalletDeposits();
    } catch (error) {
      console.error("REJECT WALLET DEPOSIT ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text:
          error.response?.data?.message ||
          "Failed to reject wallet deposit.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER DEPOSITS
  |--------------------------------------------------------------------------
  */

  const filteredDeposits = useMemo(() => {
    return deposits.filter((deposit) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        deposit.fullname
          ?.toLowerCase()
          .includes(searchValue) ||
        deposit.username
          ?.toLowerCase()
          .includes(searchValue) ||
        deposit.mpesa_code
          ?.toLowerCase()
          .includes(searchValue) ||
        deposit.bank_reference
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        deposit.status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        deposit.payment_method === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    deposits,
    search,
    statusFilter,
    paymentFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const pending = deposits.filter(
      (d) => d.status === "pending"
    );

    const verified = deposits.filter(
      (d) => d.status === "verified"
    );

    const rejected = deposits.filter(
      (d) => d.status === "rejected"
    );

    const pendingAmount = pending.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0
    );

    const verifiedAmount = verified.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0
    );

    const availableWallet = verified.reduce(
      (sum, d) =>
        sum + Number(d.remaining_balance || 0),
      0
    );

    return {
      totalDeposits: deposits.length,
      pendingCount: pending.length,
      verifiedCount: verified.length,
      rejectedCount: rejected.length,
      pendingAmount,
      verifiedAmount,
      availableWallet,
    };
  }, [deposits]);

  /*
  |--------------------------------------------------------------------------
  | STATUS BADGE
  |--------------------------------------------------------------------------
  */

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PAYMENT BADGE
  |--------------------------------------------------------------------------
  */

  const getPaymentBadge = (method) => {
    switch (method) {
      case "mpesa":
        return "bg-green-50 text-green-700";

      case "bank":
        return "bg-blue-50 text-blue-700";

      case "cash":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-KE",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ClipLoader size={28} />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-4">

      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div>
          <h1 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <WalletIcon size={17} />
            Wallet
          </h1>

          <p className="text-[10px] text-gray-500 mt-0.5">
            Manage member wallet deposits and allocations
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-1.5 border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] text-gray-600"
        >
          <RefreshCw
            size={13}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* ================================================================
          STAT CARDS
      ================================================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* TOTAL */}

        <div className="bg-white border rounded-lg p-3">
          <p className="text-[10px] text-gray-500">
            Total Deposits
          </p>

          <p className="text-lg font-semibold text-gray-800 mt-1">
            {stats.totalDeposits}
          </p>

          <p className="text-[9px] text-gray-400">
            All wallet transactions
          </p>
        </div>

        {/* PENDING */}

        <div className="bg-white border rounded-lg p-3">
          <p className="text-[10px] text-gray-500">
            Pending
          </p>

          <p className="text-lg font-semibold text-yellow-600 mt-1">
            {stats.pendingCount}
          </p>

          <p className="text-[9px] text-gray-400">
            KES{" "}
            {stats.pendingAmount.toLocaleString()}
          </p>
        </div>

        {/* VERIFIED */}

        <div className="bg-white border rounded-lg p-3">
          <p className="text-[10px] text-gray-500">
            Verified
          </p>

          <p className="text-lg font-semibold text-green-600 mt-1">
            {stats.verifiedCount}
          </p>

          <p className="text-[9px] text-gray-400">
            KES{" "}
            {stats.verifiedAmount.toLocaleString()}
          </p>
        </div>

        {/* AVAILABLE */}

        <div className="bg-white border rounded-lg p-3">
          <p className="text-[10px] text-gray-500">
            Available Wallet
          </p>

          <p className="text-lg font-semibold text-blue-600 mt-1">
            KES{" "}
            {stats.availableWallet.toLocaleString()}
          </p>

          <p className="text-[9px] text-gray-400">
            Available for allocation
          </p>
        </div>

      </div>

      {/* ================================================================
          FILTERS
      ================================================================= */}

      <div className="bg-white border rounded-lg p-3">

        <div className="flex flex-col lg:flex-row gap-2">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={14}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search member, username, M-Pesa code..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full border rounded-md pl-8 pr-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
            />

          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border rounded-md px-2 py-1.5 text-[11px]"
          >
            <option value="all">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="verified">
              Verified
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>

          {/* PAYMENT METHOD */}

          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(e.target.value)
            }
            className="border rounded-md px-2 py-1.5 text-[11px]"
          >
            <option value="all">
              All Methods
            </option>

            <option value="mpesa">
              M-Pesa
            </option>

            <option value="bank">
              Bank
            </option>

            <option value="cash">
              Cash
            </option>
          </select>

        </div>

      </div>

      {/* ================================================================
          DEPOSITS TABLE
      ================================================================= */}

      <div className="bg-white border rounded-lg overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px] text-[11px]">

            <thead className="bg-gray-50 border-b">

              <tr>

                <th className="text-left px-3 py-2">
                  Member
                </th>

                <th className="text-left px-3 py-2">
                  Amount
                </th>

                <th className="text-left px-3 py-2">
                  Method
                </th>

                <th className="text-left px-3 py-2">
                  Reference
                </th>

                <th className="text-left px-3 py-2">
                  Remaining
                </th>

                <th className="text-left px-3 py-2">
                  Status
                </th>

                <th className="text-left px-3 py-2">
                  Date
                </th>

                <th className="text-right px-3 py-2">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredDeposits.length > 0 ? (

                filteredDeposits.map((deposit) => (

                  <tr
                    key={deposit.id}
                    className="border-b hover:bg-gray-50"
                  >

                    {/* MEMBER */}

                    <td className="px-3 py-2">

                      <div className="font-medium text-gray-800">
                        {deposit.fullname ||
                          "Unknown Member"}
                      </div>

                      <div className="text-[9px] text-gray-400">
                        {deposit.username || "-"}
                      </div>

                    </td>

                    {/* AMOUNT */}

                    <td className="px-3 py-2 font-medium">
                      KES{" "}
                      {Number(
                        deposit.amount || 0
                      ).toLocaleString()}
                    </td>

                    {/* METHOD */}

                    <td className="px-3 py-2">

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] capitalize ${getPaymentBadge(
                          deposit.payment_method
                        )}`}
                      >
                        {deposit.payment_method ||
                          "-"}
                      </span>

                    </td>

                    {/* REFERENCE */}

                    <td className="px-3 py-2 text-gray-600">

                      {deposit.payment_method ===
                      "mpesa"
                        ? deposit.mpesa_code || "-"
                        : deposit.bank_reference ||
                          "-"}

                    </td>

                    {/* REMAINING */}

                    <td className="px-3 py-2">

                      <span className="font-medium text-blue-600">
                        KES{" "}
                        {Number(
                          deposit.remaining_balance ||
                            0
                        ).toLocaleString()}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td className="px-3 py-2">

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] capitalize ${getStatusBadge(
                          deposit.status
                        )}`}
                      >
                        {deposit.status}
                      </span>

                    </td>

                    {/* DATE */}

                    <td className="px-3 py-2 text-gray-500">
                      {formatDate(
                        deposit.created_at
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-3 py-2">

                      <div className="flex justify-end items-center gap-1">

                        {/* VIEW */}

                        <button
                          onClick={() => {
                            setSelectedDeposit(
                              deposit
                            );
                            setShowDetails(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
                          title="View"
                        >
                          <Eye size={13} />
                        </button>

                        {/* VERIFY */}

                        {deposit.status ===
                          "pending" && (
                          <button
                            onClick={() =>
                              handleVerify(
                                deposit
                              )
                            }
                            disabled={
                              processingId ===
                              deposit.id
                            }
                            className="p-1.5 rounded-md hover:bg-green-100 text-green-600"
                            title="Verify"
                          >
                            {processingId ===
                            deposit.id ? (
                              <ClipLoader
                                size={12}
                              />
                            ) : (
                              <CheckCircle
                                size={13}
                              />
                            )}
                          </button>
                        )}

                        {/* REJECT */}

                        {deposit.status ===
                          "pending" && (
                          <button
                            onClick={() =>
                              handleReject(
                                deposit
                              )
                            }
                            disabled={
                              processingId ===
                              deposit.id
                            }
                            className="p-1.5 rounded-md hover:bg-red-100 text-red-600"
                            title="Reject"
                          >
                            <XCircle size={13} />
                          </button>
                        )}

                        {/* ALLOCATE */}

                        {deposit.status ===
                          "verified" &&
                          Number(
                            deposit.remaining_balance ||
                              0
                          ) > 0 && (
                            <button
                              onClick={() => {
                                setSelectedDeposit(
                                  deposit
                                );

                                setShowDetails(true);
                              }}
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-[9px]"
                            >
                              <Plus size={11} />
                              Allocate
                            </button>
                          )}

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-8 text-gray-400 text-[11px]"
                  >
                    No wallet deposits found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}

        <div className="px-3 py-2 bg-gray-50 text-[10px] text-gray-500">

          Showing{" "}
          {filteredDeposits.length} deposit(s)

        </div>

      </div>

      {/* ================================================================
          DEPOSIT DETAILS
      ================================================================= */}

      {showDetails && selectedDeposit && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b px-4 py-3">

              <div>

                <h2 className="text-sm font-semibold text-gray-800">
                  Wallet Deposit
                </h2>

                <p className="text-[10px] text-gray-500">
                  Deposit #{selectedDeposit.id}
                </p>

              </div>

              <button
                onClick={() =>
                  setShowDetails(false)
                }
                className="text-gray-400 hover:text-gray-700"
              >
                <XCircle size={18} />
              </button>

            </div>

            {/* DETAILS */}

            <div className="p-4 space-y-3">

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <p className="text-[9px] text-gray-400">
                    Member
                  </p>

                  <p className="text-[11px] font-medium">
                    {selectedDeposit.fullname ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400">
                    Username
                  </p>

                  <p className="text-[11px]">
                    {selectedDeposit.username ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400">
                    Amount
                  </p>

                  <p className="text-[11px] font-semibold">
                    KES{" "}
                    {Number(
                      selectedDeposit.amount ||
                        0
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400">
                    Remaining Balance
                  </p>

                  <p className="text-[11px] font-semibold text-blue-600">
                    KES{" "}
                    {Number(
                      selectedDeposit.remaining_balance ||
                        0
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400">
                    Payment Method
                  </p>

                  <p className="text-[11px] capitalize">
                    {selectedDeposit.payment_method ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400">
                    Status
                  </p>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] capitalize ${getStatusBadge(
                      selectedDeposit.status
                    )}`}
                  >
                    {selectedDeposit.status}
                  </span>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400">
                    M-Pesa Code
                  </p>

                  <p className="text-[11px]">
                    {selectedDeposit.mpesa_code ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400">
                    Bank Reference
                  </p>

                  <p className="text-[11px]">
                    {selectedDeposit.bank_reference ||
                      "-"}
                  </p>
                </div>

              </div>

              {selectedDeposit.notes && (

                <div className="bg-gray-50 border rounded-lg p-3">

                  <p className="text-[9px] text-gray-400 mb-1">
                    Notes
                  </p>

                  <p className="text-[10px] text-gray-700">
                    {selectedDeposit.notes}
                  </p>

                </div>

              )}

            </div>

            {/* FOOTER */}

            <div className="border-t px-4 py-3 flex justify-end gap-2">

              {selectedDeposit.status ===
                "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleReject(
                        selectedDeposit
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-[10px] border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() =>
                      handleVerify(
                        selectedDeposit
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-[10px] bg-green-600 text-white hover:bg-green-700"
                  >
                    Verify Deposit
                  </button>
                </>
              )}

              {selectedDeposit.status ===
                "verified" &&
                Number(
                  selectedDeposit.remaining_balance ||
                    0
                ) > 0 && (
                  <button
                    onClick={() => {
                      /*
                       * Allocation modal will be
                       * connected here next.
                       */
                      Swal.fire({
                        icon: "info",
                        title: "Allocation",
                        text:
                          "The wallet allocation interface is the next part we are connecting.",
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] bg-green-600 text-white hover:bg-green-700"
                  >
                    Allocate Wallet
                  </button>
                )}

              <button
                onClick={() =>
                  setShowDetails(false)
                }
                className="px-3 py-1.5 rounded-lg text-[10px] border text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Wallet;