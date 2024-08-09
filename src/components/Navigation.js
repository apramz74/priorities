import React, { useState } from "react";
import logo from "./logo.png";
import { ReactComponent as MiscIcon } from "./misc_icon.svg"; // Import SVG as a React component
import { ReactComponent as CompletedCheckmarkIcon } from "./completed_checkmark_icon.svg";
import AddPriorityModal from "./AddPriorityModal";

const Navigation = ({
  priorities,
  selectedPriority,
  onSelectPriority,
  onGoHome,
  setView,
  addPriority,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrioritySlot, setNewPrioritySlot] = useState(null);
  const activePriorities = priorities.filter((priority) => !priority.completed);
  const completedPriorities = priorities.filter(
    (priority) => priority.completed && priority.name !== "Miscellaneous"
  );

  const handlePriorityClick = (priority) => {
    onSelectPriority(priority);
    setView("priority");
  };

  const handleMiscellaneousClick = () => {
    setView("miscellaneous");
  };

  const handleAddPriorityClick = (index) => {
    setNewPrioritySlot(index);
    setIsModalOpen(true);
  };

  const handleAddPriority = async (name) => {
    const newPriority = await addPriority(name, newPrioritySlot);
    if (newPriority) {
      onSelectPriority(newPriority);
      setView("priority");
    }
    setIsModalOpen(false);
    setNewPrioritySlot(null);
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

      <div className="h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Priorities</h3>
        <ul className="space-y-2 mb-2">
          {[...Array(5)].map((_, index) => {
            const priority = activePriorities[index];
            return (
              <li key={priority ? priority.id : `empty-${index}`}>
                {priority ? (
                  <button
                    onClick={() => handlePriorityClick(priority)}
                    className={`w-full text-left py-2 px-4 rounded flex items-center text-sm ${
                      selectedPriority?.id === priority.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-black mr-6 w-6 flex-shrink-0">
                      P{index + 1}
                    </span>
                    <span className="font-medium truncate">
                      {priority.name}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddPriorityClick(index)}
                    className="w-full text-left py-2 px-4 rounded flex items-center text-sm hover:bg-gray-100"
                  >
                    <span className="font-black mr-6 w-6 flex-shrink-0 text-black">
                      P{index + 1}
                    </span>
                    <span className="font-medium text-[#0000D1] truncate">
                      Add priority
                    </span>
                  </button>
                )}
              </li>
            );
          })}
          <li>
            <button
              onClick={handleMiscellaneousClick}
              className="w-full text-left py-2 px-4 rounded text-gray-600 hover:bg-gray-100 flex items-center text-sm"
            >
              <MiscIcon className="w-5 h-5 mr-6" />
              <span className="font-medium">Miscellaneous</span>
            </button>
          </li>
        </ul>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">History</h3>
          <ul className="space-y-2">
            {completedPriorities.map((priority) => (
              <li key={priority.id}>
                <button
                  onClick={() => handlePriorityClick(priority)}
                  className="w-full text-left py-2 px-4 rounded flex items-center text-sm text-gray-500 hover:bg-gray-100"
                >
                  <div className="flex-shrink-0 w-6 h-6 mr-6">
                    <CompletedCheckmarkIcon className="w-full h-full text-green-500" />
                  </div>
                  <span className="line-through font-medium truncate">
                    {priority.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {isModalOpen && (
        <AddPriorityModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddPriority}
          slot={newPrioritySlot + 1}
        />
      )}
    </nav>
  );
};

export default Navigation;
