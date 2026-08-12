const LoanPagination = ({ page, totalPages, setPage }) => {
  return (
    <div className="bg-white border rounded-lg px-3 py-2 flex items-center justify-between text-[10px] shadow-sm">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
        className="px-2.5 py-1 border rounded-md text-[10px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Previous
      </button>

      <span className="font-medium text-gray-600">
        Page <span className="text-gray-800">{totalPages === 0 ? 0 : page}</span> of{" "}
        <span className="text-gray-800">{totalPages}</span>
      </span>

      <button
        disabled={page >= totalPages}
        onClick={() => setPage((p) => p + 1)}
        className="px-2.5 py-1 border rounded-md text-[10px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Next
      </button>
    </div>
  );
};

export default LoanPagination;