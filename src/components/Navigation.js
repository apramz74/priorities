import React from "react";

const Navigation = ({
  priorities,
  selectedPriority,
  onSelectPriority,
  onGoHome,
  setView,
}) => {
  return (
    <nav className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={onGoHome}
          className="text-blue-500 hover:text-blue-700"
        >
          ← Home
        </button>
        {priorities
          .filter((priority) => priority.name !== "Miscellaneous")
          .map((priority) => (
            <button
              key={priority.id}
              onClick={() => onSelectPriority(priority)}
              className={`px-3 py-1 rounded-full ${
                selectedPriority?.id === priority.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {priority.name}
            </button>
          ))}
      </div>
      <button
        onClick={() => setView("miscellaneous")}
        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 text-sm"
      >
        Miscellaneous
      </button>
    </nav>
  );
};

export default Navigation;
