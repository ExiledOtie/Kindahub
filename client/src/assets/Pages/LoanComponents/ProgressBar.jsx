const ProgressBar = ({ progress = 0 }) => {
  const value = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            value >= 100
              ? "bg-blue-600"
              : value >= 70
              ? "bg-green-600"
              : value >= 40
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>

      <span className="w-8 text-right text-[9px] font-medium text-gray-500">
        {value.toFixed(0)}%
      </span>
    </div>
  );
};

export default ProgressBar;