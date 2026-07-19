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
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="text-green-600 text-sm" />

        <h3 className="font-semibold text-sm">Loan Filters</h3>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        {/* SEARCH */}

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />

          <input
            type="text"
            placeholder="Search member / username / loan ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-[11px] focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-[11px] focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="repaid">Repaid</option>
        </select>

        {/* GROUP */}

        <select
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-[11px] focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Groups</option>

          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>

        {/* CLEAR */}

        <button
          onClick={clearFilters}
          className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] font-medium"
        >
          <FaSyncAlt />
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default LoanFilters;
