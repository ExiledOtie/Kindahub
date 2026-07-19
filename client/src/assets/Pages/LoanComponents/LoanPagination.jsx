const LoanPagination = ({ page, totalPages, setPage }) => {
  return (
    <div className="bg-white border rounded-xl px-4 py-3 flex justify-between items-center text-[11px]">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
        className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
      >
        Previous
      </button>

      <span>
        Page {totalPages === 0 ? 0 : page} of {totalPages}
      </span>

      <button
        disabled={page >= totalPages}
        onClick={() => setPage((p) => p + 1)}
        className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

export default LoanPagination;