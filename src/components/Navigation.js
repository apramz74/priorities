import React from "react";
import logo from "./logo.png";
import { ReactComponent as MiscIcon } from "./misc_icon.svg"; // Import SVG as a React component

const Navigation = ({
  priorities,
  selectedPriority,
  onSelectPriority,
  onGoHome,
  setView,
}) => {
  const handlePriorityClick = (priority) => {
    onSelectPriority(priority);
    setView("priority");
  };

  const handleMiscellaneousClick = () => {
    setView("miscellaneous");
  };

  return (
    <nav className="w-72 bg-white border-r border-gray-200 h-screen p-6 flex flex-col">
      <div className="mb-8">
        <button
          onClick={onGoHome}
          className="text-[#0000D1] font-extrabold text-xl flex items-center"
        >
          <img src={logo} alt="Prioritiez Logo" className="h-10 w-10 mr-2" />
          prioritiez
        </button>
      </div>

      <div className="mb-6">
        <ul className="space-y-3">
          {priorities
            .filter((priority) => priority.name !== "Miscellaneous")
            .map((priority, index) => (
              <li key={priority.id}>
                <button
                  onClick={() => handlePriorityClick(priority)}
                  className={`w-full text-left py-2 px-4 rounded flex items-center text-sm ${
                    selectedPriority?.id === priority.id
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-black mr-6 w-6">P{index + 1}</span>
                  <span className="font-medium">{priority.name}</span>
                </button>
              </li>
            ))}
        </ul>
      </div>
      <div className="mb-8">
        <button
          onClick={handleMiscellaneousClick}
          className="w-full text-left py-2 px-3 rounded text-gray-600 hover:bg-gray-100 flex items-center text-sm"
        >
          <MiscIcon className="w-5 h-5 mr-6" />
          <span className="font-medium">Miscellaneous</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
