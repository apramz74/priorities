import React, { useState, useEffect } from "react";
import TodoSection from "./TodoSection";
import MilestoneProgress from "./MilestoneProgress";
import DependencySection from "./DependencySection";
import { ReactComponent as PencilIcon } from "./pencil_icon.svg";
import { ReactComponent as CheckmarkIcon } from "./checkmark_icon.svg";
import { ReactComponent as RewindIcon } from "./rewind_icon.svg";
import {
  updatePriority,
  fetchTodos,
  fetchMilestones,
  fetchDependencies,
} from "../utils/api";

const PriorityView = ({
  selectedPriority,
  updatePriorities,
  setView,
  setSelectedPriority,
  activePrioritiesCount,
}) => {
  const [todos, setTodos] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (selectedPriority) {
      fetchTodos(selectedPriority.id).then(setTodos);
      fetchMilestones(selectedPriority.id).then(setMilestones);
      fetchDependencies(selectedPriority.id).then(setDependencies);
    }
  }, [selectedPriority]);

  useEffect(() => {
    const updateTooltipPosition = (e) => {
      const tooltip = document.querySelector("[data-tooltip]:hover::after");
      if (tooltip) {
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
      }
    };

    document.addEventListener("mousemove", updateTooltipPosition);

    return () => {
      document.removeEventListener("mousemove", updateTooltipPosition);
    };
  }, []);

  const handleUpdatePriority = async () => {
    const updatedPriority = { ...selectedPriority, name: editedName };
    const success = await updatePriority(updatedPriority);
    if (success) {
      updatePriorities(updatedPriority);
      setIsEditing(false);
    } else {
      console.error("Failed to update priority");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(selectedPriority.name);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName("");
  };

  const handleMarkComplete = async () => {
    const updatedPriority = { ...selectedPriority, completed: true };
    const success = await updatePriority(updatedPriority);
    if (success) {
      updatePriorities(updatedPriority);
      setSelectedPriority(updatedPriority);
    } else {
      console.error("Failed to mark priority as complete");
    }
  };

  const handleReopenPriority = async () => {
    const updatedPriority = { ...selectedPriority, completed: false };
    const success = await updatePriority(updatedPriority);
    if (success) {
      updatePriorities(updatedPriority);
      setSelectedPriority(updatedPriority);
    } else {
      console.error("Failed to reopen priority");
    }
  };

  if (!selectedPriority) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-grow relative">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center justify-between mb-4">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-grow border rounded px-2 py-1 text-2xl font-semibold"
                  autoFocus
                />
                <button
                  onClick={handleUpdatePriority}
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black">{selectedPriority.name}</h2>
                <button
                  onClick={handleEdit}
                  className="text-gray-400 hover:text-blue-500 focus:outline-none"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          {selectedPriority.completed ? (
            <button
              onClick={handleReopenPriority}
              disabled={activePrioritiesCount >= 5}
              className={`flex items-center bg-white border-2 border-black text-black px-4 py-2 rounded-[5px] transition-colors duration-200 ${
                activePrioritiesCount >= 5
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
              data-tooltip={
                activePrioritiesCount >= 5
                  ? "You already have 5 priorities"
                  : ""
              }
            >
              <RewindIcon className="w-5 h-5 mr-2" />
              <span className="font-inter font-bold text-xs">
                Reopen this priority
              </span>
            </button>
          ) : (
            <button
              onClick={handleMarkComplete}
              className="flex items-center bg-white border-2 border-black text-black px-4 py-2 rounded-[5px] transition-colors duration-200 hover:bg-gray-100"
            >
              <CheckmarkIcon className="w-5 h-5 mr-2" />
              <span className="font-inter font-bold text-xs">
                Mark this as complete
              </span>
            </button>
          )}
        </div>

        <MilestoneProgress
          milestones={milestones}
          setMilestones={setMilestones}
          selectedPriority={selectedPriority}
        />

        <div className="space-y-6 w-full">
          <TodoSection
            todos={todos}
            setTodos={setTodos}
            priorityId={selectedPriority.id}
          />
          <DependencySection
            dependencies={dependencies}
            setDependencies={setDependencies}
            priorityId={selectedPriority.id}
          />
        </div>
      </div>
    </div>
  );
};

export default PriorityView;
