// assets/Pages/Users/UserWalletDeposits.jsx

import React, { useEffect, useState } from "react";
import { Plus, Wallet, RefreshCw, Eye } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

import axios from "../../Utils/axios";

const UserWalletDeposits = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [deposits, setDeposits] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDeposit, setSelectedDeposit] = useState(null);

    const [form, setForm] = useState({
        amount: "",
        payment_method: "mpesa",
        mpesa_code: "",
        bank_reference: "",
        notes: "",
    });

    // ============================================================
    // FETCH MY WALLET DEPOSITS
    // ============================================================

    const fetchDeposits = async () => {
        try {
            setLoading(true);

            const response = await axios.get("/wallet-deposits/my");

            const data = response.data?.data || response.data?.deposits || [];

            setDeposits(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load wallet deposits:", error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "Failed to load your wallet deposits.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    // ============================================================
    // FORM HANDLING
    // ============================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm({
            amount: "",
            payment_method: "mpesa",
            mpesa_code: "",
            bank_reference: "",
            notes: "",
        });
    };

    // ============================================================
    // SUBMIT WALLET DEPOSIT
    // ============================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.amount || Number(form.amount) <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Amount",
                text: "Please enter a valid amount.",
            });

            return;
        }

        if (form.payment_method === "mpesa" && !form.mpesa_code.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Mpesa Code Required",
                text: "Please enter your Mpesa transaction code.",
            });

            return;
        }

        if (
            form.payment_method === "bank" &&
            !form.bank_reference.trim()
        ) {
            Swal.fire({
                icon: "warning",
                title: "Bank Reference Required",
                text: "Please enter your bank reference.",
            });

            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                amount: Number(form.amount),
                payment_method: form.payment_method,
                mpesa_code:
                    form.payment_method === "mpesa"
                        ? form.mpesa_code.trim()
                        : null,
                bank_reference:
                    form.payment_method === "bank"
                        ? form.bank_reference.trim()
                        : null,
                notes: form.notes.trim() || null,
            };

            const response = await axios.post(
                "/wallet-deposits/my",
                payload
            );

            Swal.fire({
                icon: "success",
                title: "Deposit Submitted",
                text:
                    response.data?.message ||
                    "Your wallet deposit has been submitted successfully.",
                timer: 2200,
                showConfirmButton: false,
            });

            resetForm();
            setShowModal(false);

            await fetchDeposits();
        } catch (error) {
            console.error("Wallet deposit error:", error);

            Swal.fire({
                icon: "error",
                title: "Deposit Failed",
                text:
                    error.response?.data?.message ||
                    "Failed to submit wallet deposit.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================================
    // STATUS BADGE
    // ============================================================

    const getStatusBadge = (status) => {
        switch (status) {
            case "verified":
            case "completed":
                return "bg-green-100 text-green-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "rejected":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatStatus = (status) => {
        if (!status) return "Unknown";

        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // ============================================================
    // TOTALS
    // ============================================================

    const verifiedDeposits = deposits.filter(
        (deposit) =>
            deposit.status === "verified" ||
            deposit.status === "completed"
    );

    const pendingDeposits = deposits.filter(
        (deposit) => deposit.status === "pending"
    );

    const totalVerified = verifiedDeposits.reduce(
        (total, deposit) => total + Number(deposit.amount || 0),
        0
    );

    const totalPending = pendingDeposits.reduce(
        (total, deposit) => total + Number(deposit.amount || 0),
        0
    );

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <ClipLoader size={25} />
            </div>
        );
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="space-y-4">

            {/* ======================================================
          HEADER
      ====================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                    <h1 className="text-sm font-semibold text-gray-800">
                        My Wallet
                    </h1>

                    <p className="text-[10px] text-gray-500 mt-0.5">
                        Manage your wallet deposits and payment records
                    </p>
                </div>

                <div className="flex items-center gap-2">

                    <button
                        onClick={fetchDeposits}
                        className="flex items-center gap-1 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] hover:bg-gray-50"
                    >
                        <RefreshCw size={12} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px]"
                    >
                        <Plus size={13} />
                        Deposit Money
                    </button>

                </div>
            </div>

            {/* ======================================================
          WALLET SUMMARY
      ====================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* Verified */}

                <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] text-gray-500">
                                Verified Deposits
                            </p>

                            <h2 className="text-base font-semibold text-gray-800 mt-1">
                                KES {totalVerified.toLocaleString()}
                            </h2>
                        </div>

                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <Wallet size={15} className="text-green-600" />
                        </div>

                    </div>
                </div>

                {/* Pending */}

                <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] text-gray-500">
                                Pending Deposits
                            </p>

                            <h2 className="text-base font-semibold text-gray-800 mt-1">
                                KES {totalPending.toLocaleString()}
                            </h2>
                        </div>

                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <Wallet size={15} className="text-yellow-600" />
                        </div>

                    </div>
                </div>

                {/* Transactions */}

                <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] text-gray-500">
                                Total Deposits
                            </p>

                            <h2 className="text-base font-semibold text-gray-800 mt-1">
                                {deposits.length}
                            </h2>
                        </div>

                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Wallet size={15} className="text-blue-600" />
                        </div>

                    </div>
                </div>

            </div>

            {/* ======================================================
          DEPOSIT TABLE
      ====================================================== */}

            <div className="bg-white border rounded-lg overflow-hidden">

                <div className="px-3 py-2 border-b flex items-center justify-between">

                    <div>
                        <h2 className="text-xs font-semibold text-gray-800">
                            Wallet Deposits
                        </h2>

                        <p className="text-[9px] text-gray-400">
                            Your wallet funding history
                        </p>
                    </div>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[750px] text-[10px]">

                        <thead className="bg-gray-50 border-b">

                            <tr>

                                <th className="text-left px-3 py-2">
                                    Date
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
                                    Status
                                </th>

                                <th className="text-right px-3 py-2">
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {deposits.length > 0 ? (

                                deposits.map((deposit) => (

                                    <tr
                                        key={deposit.id}
                                        className="border-b hover:bg-gray-50"
                                    >

                                        <td className="px-3 py-2 text-gray-600">
                                            {deposit.created_at
                                                ? new Date(
                                                    deposit.created_at
                                                ).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td className="px-3 py-2 font-medium text-gray-800">
                                            KES{" "}
                                            {Number(
                                                deposit.amount || 0
                                            ).toLocaleString()}
                                        </td>

                                        <td className="px-3 py-2 capitalize text-gray-600">
                                            {deposit.payment_method || "-"}
                                        </td>

                                        <td className="px-3 py-2 text-gray-600">

                                            {deposit.payment_method === "mpesa"
                                                ? deposit.mpesa_code || "-"
                                                : deposit.bank_reference || "-"}

                                        </td>

                                        <td className="px-3 py-2">

                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[9px] ${getStatusBadge(
                                                    deposit.status
                                                )}`}
                                            >
                                                {formatStatus(deposit.status)}
                                            </span>

                                        </td>

                                        <td className="px-3 py-2 text-right">

                                            <button
                                                onClick={() =>
                                                    setSelectedDeposit(deposit)
                                                }
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[10px]"
                                            >
                                                <Eye size={12} />
                                                View
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="text-center py-8 text-gray-400 text-[10px]"
                                    >
                                        You have no wallet deposits yet.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                <div className="px-3 py-2 bg-gray-50 text-[9px] text-gray-500">
                    Showing {deposits.length} deposit(s)
                </div>

            </div>

            {/* ======================================================
          CREATE DEPOSIT MODAL
      ====================================================== */}

            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

                        {/* Header */}

                        <div className="flex items-center justify-between px-4 py-3 border-b">

                            <div>
                                <h2 className="text-sm font-semibold text-gray-800">
                                    Deposit Money
                                </h2>

                                <p className="text-[9px] text-gray-400">
                                    Add money to your wallet
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600 text-lg"
                            >
                                ×
                            </button>

                        </div>

                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="p-4 space-y-3"
                        >

                            {/* Amount */}

                            <div>

                                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    min="1"
                                    placeholder="Enter amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
                                />

                            </div>

                            {/* Payment Method */}

                            <div>

                                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                    Payment Method
                                </label>

                                <select
                                    name="payment_method"
                                    value={form.payment_method}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
                                >

                                    <option value="mpesa">
                                        Mpesa
                                    </option>

                                    <option value="bank">
                                        Bank
                                    </option>

                                </select>

                            </div>

                            {/* Mpesa */}

                            {form.payment_method === "mpesa" && (

                                <div>

                                    <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                        Mpesa Transaction Code
                                    </label>

                                    <input
                                        type="text"
                                        name="mpesa_code"
                                        placeholder="e.g. QWE123ABC"
                                        value={form.mpesa_code}
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-3 py-2 text-[11px] uppercase focus:outline-none focus:ring-1 focus:ring-green-500"
                                    />

                                </div>

                            )}

                            {/* Bank */}

                            {form.payment_method === "bank" && (

                                <div>

                                    <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                        Bank Reference
                                    </label>

                                    <input
                                        type="text"
                                        name="bank_reference"
                                        placeholder="Enter bank reference"
                                        value={form.bank_reference}
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
                                    />

                                </div>

                            )}

                            {/* Notes */}

                            <div>

                                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    rows="3"
                                    placeholder="Optional notes..."
                                    value={form.notes}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
                                />

                            </div>

                            {/* Buttons */}

                            <div className="flex justify-end gap-2 pt-2">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-3 py-1.5 border rounded-md text-[10px] text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md text-[10px]"
                                >

                                    {submitting ? (
                                        <>
                                            <ClipLoader
                                                size={11}
                                                color="#ffffff"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Deposit"
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ======================================================
          VIEW DEPOSIT MODAL
      ====================================================== */}

            {selectedDeposit && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">

                        <div className="flex items-center justify-between px-4 py-3 border-b">

                            <h2 className="text-sm font-semibold text-gray-800">
                                Deposit Details
                            </h2>

                            <button
                                onClick={() => setSelectedDeposit(null)}
                                className="text-gray-400 hover:text-gray-600 text-lg"
                            >
                                ×
                            </button>

                        </div>

                        <div className="p-4 space-y-3 text-[10px]">

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Amount
                                </span>

                                <span className="font-semibold">
                                    KES{" "}
                                    {Number(
                                        selectedDeposit.amount || 0
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Payment Method
                                </span>

                                <span className="capitalize">
                                    {selectedDeposit.payment_method || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Reference
                                </span>

                                <span>
                                    {selectedDeposit.payment_method === "mpesa"
                                        ? selectedDeposit.mpesa_code || "-"
                                        : selectedDeposit.bank_reference || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Status
                                </span>

                                <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] ${getStatusBadge(
                                        selectedDeposit.status
                                    )}`}
                                >
                                    {formatStatus(selectedDeposit.status)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Submitted
                                </span>

                                <span>
                                    {selectedDeposit.created_at
                                        ? new Date(
                                            selectedDeposit.created_at
                                        ).toLocaleString()
                                        : "-"}
                                </span>
                            </div>

                            {selectedDeposit.notes && (

                                <div className="pt-2 border-t">

                                    <p className="text-gray-500 mb-1">
                                        Notes
                                    </p>

                                    <p className="text-gray-700">
                                        {selectedDeposit.notes}
                                    </p>

                                </div>

                            )}

                        </div>

                        <div className="px-4 py-3 border-t flex justify-end">

                            <button
                                onClick={() => setSelectedDeposit(null)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-[10px]"
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

export default UserWalletDeposits;