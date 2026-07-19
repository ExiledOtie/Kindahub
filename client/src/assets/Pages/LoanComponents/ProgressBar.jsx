const ProgressBar = ({ progress = 0 }) => {
  const value = Math.min(progress, 100);

  return (
    <div className="flex items-center gap-2 w-full">

      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">

        <div
          className={`h-full transition-all duration-500 ${
            value >= 100
              ? "bg-blue-600"
              : value >= 70
              ? "bg-green-600"
              : value >= 40
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{
            width: `${value}%`,
          }}
        />

      </div>

      <span className="text-[10px] text-gray-500 w-10 text-right">
        {value.toFixed(0)}%
      </span>

    </div>
  );
};

export default ProgressBar;