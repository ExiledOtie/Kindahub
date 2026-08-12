import { FaSearch, FaFilter, FaSyncAlt } from "react-icons/fa";

const LoanFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  groupFilter,
  setGroupFilter,
  groups = [],
  setPage,
}) => {
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setGroupFilter("all");
    setPage(1);
  };

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <FaFilter className="text-green-600 text-[11px]" />
        <h3 className="text-xs font-semibold text-gray-700">
          Loan Filters
        </h3>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-2.5">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />

          <input
            type="text"
            placeholder="Search member / username / loan ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-9 border rounded-md pl-8 pr-3 text-[10px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 border rounded-md px-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="repaid">Repaid</option>
        </select>

        {/* Group */}
        <select
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 border rounded-md px-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Groups</option>

          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>

        {/* Clear */}
        <button
          onClick={clearFilters}
          className="h-9 flex items-center justify-center gap-1.5 rounded-md border bg-gray-50 hover:bg-gray-100 text-[10px] font-medium transition"
        >
          <FaSyncAlt className="text-[10px]" />
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default LoanFilters;