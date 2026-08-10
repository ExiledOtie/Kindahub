import React, { useEffect, useMemo, useState } from "react";
import {
    Wallet,
    Plus,
    RefreshCw,
    Eye,
    X,
    CheckCircle,
    Clock,
    XCircle,
    ArrowDownToLine,
    Coins,
    CreditCard,
    Landmark,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import Swal from "sweetalert2";

import axios from "../../Utils/axios";

const UserWallet = () => {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showDepositModal, setShowDepositModal] = useState(false);

    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [loadingAllocations, setLoadingAllocations] = useState(false);

    const [form, setForm] = useState({
        amount: "",
        payment_method: "mpesa",
        mpesa_code: "",
        bank_reference: "",
        notes: "",
    });

    // ============================================================
    // FETCH WALLET DEPOSITS
    // ============================================================

    const fetchDeposits = async () => {
        try {
            setLoading(true);

            const response = await axios.get("/wallet-deposits/my");

            const data =
                response.data?.deposits ||
                response.data?.data ||
                [];

            setDeposits(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("FETCH USER WALLET ERROR:", error);

            Swal.fire({
                icon: "error",
                title: "Unable to load wallet",
                text:
                    error.response?.data?.message ||
                    "Failed to load your wallet information.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    // ============================================================
    // WALLET STATISTICS
    // ============================================================

    const walletStats = useMemo(() => {
        const verifiedDeposits = deposits.filter(
            (deposit) => deposit.status === "verified"
        );

        const pendingDeposits = deposits.filter(
            (deposit) => deposit.status === "pending"
        );

        const totalDeposited = verifiedDeposits.reduce(
            (total, deposit) =>
                total + Number(deposit.amount || 0),
            0
        );

        const currentBalance = verifiedDeposits.reduce(
            (total, deposit) =>
                total + Number(deposit.remaining_balance || 0),
            0
        );

        const totalAllocated =
            totalDeposited - currentBalance;

        const pendingAmount = pendingDeposits.reduce(
            (total, deposit) =>
                total + Number(deposit.amount || 0),
            0
        );

        return {
            totalDeposited,
            currentBalance,
            totalAllocated,
            pendingAmount,
            pendingCount: pendingDeposits.length,
        };
    }, [deposits]);

    // ============================================================
    // FORM HANDLING
    // ============================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
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

    const handleSubmitDeposit = async (e) => {
        e.preventDefault();

        if (!form.amount || Number(form.amount) <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Invalid amount",
                text: "Please enter a valid amount.",
            });

            return;
        }

        if (
            form.payment_method === "mpesa" &&
            !form.mpesa_code.trim()
        ) {
            Swal.fire({
                icon: "warning",
                title: "M-Pesa code required",
                text: "Please enter your M-Pesa transaction code.",
            });

            return;
        }

        if (
            form.payment_method === "bank" &&
            !form.bank_reference.trim()
        ) {
            Swal.fire({
                icon: "warning",
                title: "Bank reference required",
                text: "Please enter your bank transaction reference.",
            });

            return;
        }

        try {
            setSubmitting(true);

            await axios.post("/wallet-deposits/my", {
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
            });

            Swal.fire({
                icon: "success",
                title: "Deposit submitted",
                text:
                    "Your wallet deposit has been submitted and is awaiting verification.",
                timer: 2200,
                showConfirmButton: false,
            });

            resetForm();
            setShowDepositModal(false);

            await fetchDeposits();
        } catch (error) {
            console.error("CREATE WALLET DEPOSIT ERROR:", error);

            Swal.fire({
                icon: "error",
                title: "Deposit failed",
                text:
                    error.response?.data?.message ||
                    "Failed to submit wallet deposit.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================================
    // VIEW ALLOCATIONS
    // ============================================================

    const handleViewAllocations = async (deposit) => {
        if (selectedDeposit?.id === deposit.id) {
            setSelectedDeposit(null);
            setAllocations([]);
            return;
        }

        setSelectedDeposit(deposit);
        setLoadingAllocations(true);

        try {
            const response = await axios.get(
                `/wallet-allocations/deposit/${deposit.id}`
            );

            const data =
                response.data?.allocations ||
                response.data?.data ||
                [];

            setAllocations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(
                "GET WALLET ALLOCATIONS ERROR:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Unable to load allocations",
                text:
                    error.response?.data?.message ||
                    "Failed to load wallet allocation details.",
            });
        } finally {
            setLoadingAllocations(false);
        }
    };

    // ============================================================
    // FORMAT MONEY
    // ============================================================

    const formatMoney = (amount) => {
        return `KES ${Number(amount || 0).toLocaleString()}`;
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
                return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "verified":
            case "completed":
                return <CheckCircle size={12} />;

            case "pending":
                return <Clock size={12} />;

            case "rejected":
                return <XCircle size={12} />;

            default:
                return null;
        }
    };

    // ============================================================
    // ALLOCATION TYPE LABEL
    // ============================================================

    const getAllocationType = (type) => {
        switch (type) {
            case "contribution":
                return "Contribution";

            case "saving":
                return "Savings";

            case "loan_payment":
                return "Loan Payment";

            default:
                return type || "Allocation";
        }
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                    <RefreshCw
                        size={20}
                        className="animate-spin mx-auto text-green-600"
                    />

                    <p className="text-[11px] text-gray-500 mt-2">
                        Loading your wallet...
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="space-y-4">

            {/* ======================================================
          HEADER
      ====================================================== */}

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-sm font-semibold text-gray-800">
                        My Wallet
                    </h1>

                    <p className="text-[10px] text-gray-500 mt-0.5">
                        Manage your wallet deposits and allocations
                    </p>
                </div>

                <div className="flex items-center gap-2">

                    <button
                        onClick={fetchDeposits}
                        className="flex items-center gap-1 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg text-[10px]"
                    >
                        <RefreshCw size={12} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px]"
                    >
                        <Plus size={13} />
                        Add Money
                    </button>

                </div>
            </div>

            {/* ======================================================
          WALLET SUMMARY
      ====================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                {/* CURRENT BALANCE */}

                <div className="bg-white border rounded-lg p-3">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] text-gray-500">
                                Available Wallet
                            </p>

                            <h2 className="text-base font-semibold text-gray-800 mt-1">
                                {formatMoney(walletStats.currentBalance)}
                            </h2>
                        </div>

                        <div className="p-2 bg-green-50 rounded-lg">
                            <Wallet
                                size={17}
                                className="text-green-600"
                            />
                        </div>

                    </div>

                    <p className="text-[9px] text-gray-400 mt-2">
                        Available for allocation
                    </p>
                </div>

                {/* TOTAL DEPOSITED */}

                <div className="bg-white border rounded-lg p-3">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] text-gray-500">
                                Total Deposited
                            </p>

                            <h2 className="text-base font-semibold text-gray-800 mt-1">
                                {formatMoney(walletStats.totalDeposited)}
                            </h2>
                        </div>

                        <div className="p-2 bg-blue-50 rounded-lg">
                            <ArrowDownToLine
                                size={17}
                                className="text-blue-600"
                            />
                        </div>

                    </div>

                    <p className="text-[9px] text-gray-400 mt-2">
                        Verified deposits
                    </p>
                </div>

                {/* TOTAL ALLOCATED */}

                <div className="bg-white border rounded-lg p-3">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] text-gray-500">
                                Total Allocated
                            </p>

                            <h2 className="text-base font-semibold text-gray-800 mt-1">
                                {formatMoney(walletStats.totalAllocated)}
                            </h2>
                        </div>

                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Coins
                                size={17}
                                className="text-purple-600"
                            />
                        </div>

                    </div>

                    <p className="text-[9px] text-gray-400 mt-2">
                        Contributions, savings & loans
                    </p>
                </div>

                {/* PENDING */}

                <div className="bg-white border rounded-lg p-3">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-[10px] text-gray-500">
                                Pending Deposits
                            </p>

                            <h2 className="text-base font-semibold text-gray-800 mt-1">
                                {formatMoney(walletStats.pendingAmount)}
                            </h2>
                        </div>

                        <div className="p-2 bg-yellow-50 rounded-lg">
                            <Clock
                                size={17}
                                className="text-yellow-600"
                            />
                        </div>

                    </div>

                    <p className="text-[9px] text-gray-400 mt-2">
                        {walletStats.pendingCount} pending transaction
                        {walletStats.pendingCount === 1 ? "" : "s"}
                    </p>
                </div>

            </div>

            {/* ======================================================
          DEPOSIT HISTORY
      ====================================================== */}

            <div className="bg-white border rounded-lg overflow-hidden">

                <div className="px-3 py-2.5 border-b flex items-center justify-between">

                    <div>
                        <h2 className="text-xs font-semibold text-gray-800">
                            Wallet Transactions
                        </h2>

                        <p className="text-[9px] text-gray-400 mt-0.5">
                            Your wallet deposits and allocation history
                        </p>
                    </div>

                    <span className="text-[9px] text-gray-400">
                        {deposits.length} transaction
                        {deposits.length === 1 ? "" : "s"}
                    </span>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[850px] text-[10px]">

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
                                    Remaining
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

                                    <React.Fragment key={deposit.id}>

                                        <tr className="border-b hover:bg-gray-50">

                                            {/* DATE */}

                                            <td className="px-3 py-2 text-gray-600">
                                                {deposit.created_at
                                                    ? new Date(
                                                        deposit.created_at
                                                    ).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            {/* AMOUNT */}

                                            <td className="px-3 py-2 font-medium text-gray-800">
                                                {formatMoney(deposit.amount)}
                                            </td>

                                            {/* PAYMENT METHOD */}

                                            <td className="px-3 py-2">

                                                <div className="flex items-center gap-1">

                                                    {deposit.payment_method ===
                                                        "mpesa" ? (
                                                        <>
                                                            <CreditCard
                                                                size={11}
                                                                className="text-green-600"
                                                            />

                                                            <span>
                                                                M-Pesa
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Landmark
                                                                size={11}
                                                                className="text-blue-600"
                                                            />

                                                            <span>
                                                                Bank
                                                            </span>
                                                        </>
                                                    )}

                                                </div>

                                            </td>

                                            {/* REFERENCE */}

                                            <td className="px-3 py-2 text-gray-500">

                                                {deposit.payment_method ===
                                                    "mpesa"
                                                    ? deposit.mpesa_code || "-"
                                                    : deposit.bank_reference || "-"}

                                            </td>

                                            {/* REMAINING */}

                                            <td className="px-3 py-2 font-medium text-gray-700">
                                                {formatMoney(
                                                    deposit.remaining_balance
                                                )}
                                            </td>

                                            {/* STATUS */}

                                            <td className="px-3 py-2">

                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] ${getStatusBadge(
                                                        deposit.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        deposit.status
                                                    )}

                                                    {deposit.status}
                                                </span>

                                            </td>

                                            {/* ACTION */}

                                            <td className="px-3 py-2 text-right">

                                                {deposit.status ===
                                                    "verified" ? (

                                                    <button
                                                        onClick={() =>
                                                            handleViewAllocations(
                                                                deposit
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-[9px]"
                                                    >
                                                        <Eye size={11} />

                                                        {selectedDeposit?.id ===
                                                            deposit.id
                                                            ? "Hide"
                                                            : "View"}
                                                    </button>

                                                ) : (
                                                    <span className="text-gray-300">
                                                        —
                                                    </span>
                                                )}

                                            </td>

                                        </tr>

                                        {/* ==================================================
                        ALLOCATION DETAILS
                    ================================================== */}

                                        {selectedDeposit?.id ===
                                            deposit.id && (

                                                <tr>

                                                    <td
                                                        colSpan="7"
                                                        className="bg-gray-50 px-4 py-3"
                                                    >

                                                        <div className="flex items-center justify-between mb-2">

                                                            <div>

                                                                <h3 className="text-[10px] font-semibold text-gray-700">
                                                                    Allocation Details
                                                                </h3>

                                                                <p className="text-[9px] text-gray-400">
                                                                    How this wallet deposit was used
                                                                </p>

                                                            </div>

                                                            {loadingAllocations && (
                                                                <RefreshCw
                                                                    size={13}
                                                                    className="animate-spin text-green-600"
                                                                />
                                                            )}

                                                        </div>

                                                        {!loadingAllocations &&
                                                            allocations.length ===
                                                            0 && (

                                                                <div className="text-center py-4 text-[9px] text-gray-400">
                                                                    No allocations have been made
                                                                    from this deposit yet.
                                                                </div>
                                                            )}

                                                        {!loadingAllocations &&
                                                            allocations.length >
                                                            0 && (

                                                                <div className="grid gap-2">

                                                                    {allocations.map(
                                                                        (allocation) => (

                                                                            <div
                                                                                key={
                                                                                    allocation.id
                                                                                }
                                                                                className="bg-white border rounded-md px-3 py-2 flex items-center justify-between"
                                                                            >

                                                                                <div>

                                                                                    <p className="text-[10px] font-medium text-gray-700">
                                                                                        {getAllocationType(
                                                                                            allocation.allocation_type
                                                                                        )}
                                                                                    </p>

                                                                                    <p className="text-[9px] text-gray-400 mt-0.5">

                                                                                        {allocation.allocated_at
                                                                                            ? new Date(
                                                                                                allocation.allocated_at
                                                                                            ).toLocaleString()
                                                                                            : "-"}

                                                                                        {allocation.allocated_by_name &&
                                                                                            ` • By ${allocation.allocated_by_name}`}
                                                                                    </p>

                                                                                </div>

                                                                                <div className="text-right">

                                                                                    <p className="text-[10px] font-semibold text-gray-800">
                                                                                        {formatMoney(
                                                                                            allocation.amount
                                                                                        )}
                                                                                    </p>

                                                                                    {allocation.reference_id && (
                                                                                        <p className="text-[8px] text-gray-400">
                                                                                            Ref #
                                                                                            {
                                                                                                allocation.reference_id
                                                                                            }
                                                                                        </p>
                                                                                    )}

                                                                                </div>

                                                                            </div>

                                                                        )
                                                                    )}

                                                                </div>
                                                            )}

                                                    </td>

                                                </tr>
                                            )}

                                    </React.Fragment>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="text-center py-10"
                                    >

                                        <Wallet
                                            size={25}
                                            className="mx-auto text-gray-300"
                                        />

                                        <p className="text-[10px] text-gray-500 mt-2">
                                            No wallet transactions yet
                                        </p>

                                        <button
                                            onClick={() =>
                                                setShowDepositModal(true)
                                            }
                                            className="mt-2 text-green-600 hover:text-green-700 text-[9px]"
                                        >
                                            Add your first deposit
                                        </button>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ======================================================
          ADD MONEY MODAL
      ====================================================== */}

            {showDepositModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

                        {/* MODAL HEADER */}

                        <div className="px-4 py-3 border-b flex items-center justify-between">

                            <div>

                                <h2 className="text-sm font-semibold text-gray-800">
                                    Add Money to Wallet
                                </h2>

                                <p className="text-[9px] text-gray-400 mt-0.5">
                                    Submit a deposit for verification
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setShowDepositModal(false)
                                }
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={handleSubmitDeposit}
                            className="p-4 space-y-3"
                        >

                            {/* AMOUNT */}

                            <div>

                                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    min="1"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={handleChange}
                                    placeholder="Enter amount"
                                    className="w-full border rounded-md px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
                                    required
                                />

                            </div>

                            {/* PAYMENT METHOD */}

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
                                        M-Pesa
                                    </option>

                                    <option value="bank">
                                        Bank
                                    </option>
                                </select>

                            </div>

                            {/* MPESA */}

                            {form.payment_method ===
                                "mpesa" && (

                                    <div>

                                        <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                            M-Pesa Transaction Code
                                        </label>

                                        <input
                                            type="text"
                                            name="mpesa_code"
                                            value={form.mpesa_code}
                                            onChange={handleChange}
                                            placeholder="e.g. QWE123ABC"
                                            className="w-full border rounded-md px-3 py-2 text-[11px] uppercase focus:outline-none focus:ring-1 focus:ring-green-500"
                                            required
                                        />

                                    </div>
                                )}

                            {/* BANK */}

                            {form.payment_method ===
                                "bank" && (

                                    <div>

                                        <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                            Bank Reference
                                        </label>

                                        <input
                                            type="text"
                                            name="bank_reference"
                                            value={form.bank_reference}
                                            onChange={handleChange}
                                            placeholder="Enter bank reference"
                                            className="w-full border rounded-md px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
                                            required
                                        />

                                    </div>
                                )}

                            {/* NOTES */}

                            <div>

                                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                    Notes
                                    <span className="text-gray-400 font-normal">
                                        {" "}
                                        (optional)
                                    </span>
                                </label>

                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Additional information..."
                                    className="w-full border rounded-md px-3 py-2 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
                                />

                            </div>

                            {/* INFO */}

                            <div className="bg-blue-50 border border-blue-100 rounded-md p-2.5">

                                <p className="text-[9px] text-blue-700 leading-relaxed">
                                    Your deposit will remain pending until an
                                    administrator verifies the payment. Once
                                    verified, the funds will become available in
                                    your wallet.
                                </p>

                            </div>

                            {/* BUTTONS */}

                            <div className="flex justify-end gap-2 pt-1">

                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setShowDepositModal(false);
                                    }}
                                    className="px-3 py-1.5 border rounded-md text-[10px] text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-md text-[10px] flex items-center gap-1"
                                >

                                    {submitting ? (
                                        <>
                                            <RefreshCw
                                                size={11}
                                                className="animate-spin"
                                            />

                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={11} />

                                            Submit Deposit
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default UserWallet;