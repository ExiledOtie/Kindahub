import { useEffect, useMemo, useState } from "react";
import axios from "../../Utils/axios";
import { ClipLoader } from "react-spinners";
import { FaMoneyBillWave, FaSearch } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "/loan-payments/my"
      );

      setPayments(res.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalPaid = useMemo(
    () =>
      payments.reduce(
        (sum, p) =>
          sum + Number(p.amount || 0),
        0
      ),
    [payments]
  );

  const totalPrincipal = useMemo(
    () =>
      payments.reduce(
        (sum, p) =>
          sum +
          Number(
            p.principal_paid || 0
          ),
        0
      ),
    [payments]
  );

  const totalInterest = useMemo(
    () =>
      payments.reduce(
        (sum, p) =>
          sum +
          Number(
            p.interest_paid || 0
          ),
        0
      ),
    [payments]
  );

  const filteredPayments =
    useMemo(() => {
      return payments.filter(
        (payment) => {
          const searchTerm =
            search.toLowerCase();

          return (
            payment.loan_number
              ?.toString()
              .includes(search) ||
            payment.payment_method
              ?.toLowerCase()
              .includes(
                searchTerm
              )
          );
        }
      );
    }, [payments, search]);

  const totalPages =
    Math.ceil(
      filteredPayments.length /
        ITEMS_PER_PAGE
    );

  const paginatedPayments =
    useMemo(() => {
      const start =
        (page - 1) *
        ITEMS_PER_PAGE;

      return filteredPayments.slice(
        start,
        start +
          ITEMS_PER_PAGE
      );
    }, [
      filteredPayments,
      page,
    ]);

  const format = (value) =>
    Number(
      value || 0
    ).toLocaleString();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <ClipLoader
          size={35}
          color="#16a34a"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 text-[10px]">

      {/* HEADER */}

      <div className="bg-white border rounded-xl p-3 flex items-center gap-2">

        <FaMoneyBillWave className="text-green-600 text-sm" />

        <h2 className="text-sm font-semibold">
          Loan Payments
        </h2>

      </div>

      {/* SUMMARY */}

      <div className="grid md:grid-cols-3 gap-3">

        <div className="bg-white border rounded-xl p-3">

          <p className="text-gray-400 text-[10px]">
            Total Paid
          </p>

          <p className="text-base font-semibold text-green-600">
            KES {format(totalPaid)}
          </p>

        </div>

        <div className="bg-white border rounded-xl p-3">

          <p className="text-gray-400 text-[10px]">
            Principal Paid
          </p>

          <p className="text-base font-semibold text-blue-600">
            KES {format(totalPrincipal)}
          </p>

        </div>

        <div className="bg-white border rounded-xl p-3">

          <p className="text-gray-400 text-[10px]">
            Interest Paid
          </p>

          <p className="text-base font-semibold text-orange-600">
            KES {format(totalInterest)}
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="bg-white border rounded-xl p-3">

        <div className="relative w-full md:w-72">

          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />

          <input
            type="text"
            placeholder="Search loan ID or method..."
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setPage(1);
            }}
            className="w-full border rounded-lg pl-8 pr-3 py-2 text-[10px]"
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-[10px]">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-2 py-2 text-left">
                  Date
                </th>

                <th className="px-2 py-2 text-left">
                  Loan #
                </th>

                <th className="px-2 py-2 text-left">
                  Amount
                </th>

                <th className="px-2 py-2 text-left">
                  Principal
                </th>

                <th className="px-2 py-2 text-left">
                  Interest
                </th>

                <th className="px-2 py-2 text-left">
                  Method
                </th>

                <th className="px-2 py-2 text-left">
                  Balance After
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedPayments.length >
              0 ? (
                paginatedPayments.map(
                  (payment) => (
                    <tr
                      key={
                        payment.id
                      }
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="px-2 py-2">

                        {new Date(
                          payment.created_at
                        ).toLocaleDateString()}

                      </td>

                      <td className="px-2 py-2">
                        #
                        {
                          payment.loan_number
                        }
                      </td>

                      <td className="px-2 py-2 font-semibold text-green-600">
                        KES{" "}
                        {format(
                          payment.amount
                        )}
                      </td>

                      <td className="px-2 py-2">
                        KES{" "}
                        {format(
                          payment.principal_paid
                        )}
                      </td>

                      <td className="px-2 py-2">
                        KES{" "}
                        {format(
                          payment.interest_paid
                        )}
                      </td>

                      <td className="px-2 py-2 uppercase">
                        {
                          payment.payment_method
                        }
                      </td>

                      <td className="px-2 py-2 text-red-600">
                        KES{" "}
                        {format(
                          payment.balance_after
                        )}
                      </td>

                    </tr>
                  )
                )
              ) : (
                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-400"
                  >
                    No payments found
                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}

        <div className="flex justify-between items-center p-3 border-t text-[10px]">

          <button
            disabled={
              page === 1
            }
            onClick={() =>
              setPage(
                page - 1
              )
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page} of{" "}
            {totalPages || 1}
          </span>

          <button
            disabled={
              page ===
                totalPages ||
              totalPages === 0
            }
            onClick={() =>
              setPage(
                page + 1
              )
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
};

export default UserPayments;