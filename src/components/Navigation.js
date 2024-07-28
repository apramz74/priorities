import React from "react";

const Navigation = ({
  priorities,
  selectedPriority,
  onSelectPriority,
  onGoHome,
}) => {
  return (
    <nav className="flex items-center space-x-4 mb-6">
      <button
        onClick={onGoHome}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <span className="mr-1 text-lg">←</span>
        Home
      </button>
      <div className="flex space-x-2">
        {priorities.map((priority) => (
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
    </nav>
  );
};

export default Navigation;
