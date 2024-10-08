import React, { useState, useEffect, useRef } from "react";
import TodoSection from "./TodoSection";
import MilestoneProgress from "./MilestoneProgress";
import DependencySection from "./DependencySection";
import { ReactComponent as CheckmarkIcon } from "./checkmark_icon.svg";
import { ReactComponent as RewindIcon } from "./rewind_icon.svg";
import {
  updatePriority,
  fetchTodos,
  fetchMilestones,
  fetchDependencies,
  getNewOrderForReopenedPriority,
} from "../utils/api";
import NotesView from "./NotesView";

const PriorityView = ({
  selectedPriority,
  updatePriorities,
  setActiveView,
  activePrioritiesCount,
}) => {
  const [todos, setTodos] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [activeTab, setActiveTab] = useState("details");

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

  const handleUpdatePriorityName = async (newName) => {
    const updatedPriority = { ...selectedPriority, name: newName };
    const success = await updatePriority(updatedPriority);
    if (success) {
      updatePriorities(updatedPriority);
    } else {
      console.error("Failed to update priority name");
    }
  };

  const handleMarkComplete = async () => {
    const updatedPriority = { ...selectedPriority, completed: true };
    const success = await updatePriority(updatedPriority);
    if (success) {
      updatePriorities(updatedPriority);
      // Update the local state to reflect the change
    } else {
      console.error("Failed to mark priority as complete");
    }
  };

  const handleReopenPriority = async () => {
    const newOrder = await getNewOrderForReopenedPriority();
    if (newOrder === null) {
      console.error("Failed to get new order for reopened priority");
      return;
    }

    const updatedPriority = {
      ...selectedPriority,
      completed: false,
      order: newOrder,
    };
    const success = await updatePriority(updatedPriority);
    if (success) {
      updatePriorities(updatedPriority);
      // Update the local state to reflect the change
    } else {
      console.error("Failed to reopen priority");
    }
  };

  if (!selectedPriority) {
    return <div>Loading...</div>;
  }

  const EditableField = ({ value, onUpdate, className = "" }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.style.width = `${inputRef.current.scrollWidth}px`;
      }
    }, [isEditing]);

    useEffect(() => {
      setEditValue(value);
    }, [value]);

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        setIsEditing(false);
        onUpdate(editValue);
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setEditValue(value);
      }
    };

    const handleInputChange = (e) => {
      setEditValue(e.target.value);
      e.target.style.width = `${e.target.scrollWidth}px`;
    };

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onBlur={() => {
            setIsEditing(false);
            onUpdate(editValue);
          }}
          onKeyDown={handleKeyDown}
          className={`border rounded px-2 py-1 ${className}`}
          style={{ minWidth: "100px" }}
        />
      );
    }

    return (
      <div
        onClick={() => setIsEditing(true)}
        className={`cursor-pointer ${className}`}
      >
        {value}
      </div>
    );
  };

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-between mb-4">
            <EditableField
              value={selectedPriority.name}
              onUpdate={handleUpdatePriorityName}
              className="text-3xl font-black"
            />
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
              {...(activePrioritiesCount >= 5
                ? { "data-tooltip": "You already have 5 priorities" }
                : {})}
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
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              className={`py-2 px-6 rounded-md text-sm ${
                activeTab === "details"
                  ? "bg-indigo-100 text-indigo-700 font-semibold border border-indigo-700"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Plan
            </button>
            <button
              className={`py-2 px-6 rounded-md text-sm ${
                activeTab === "notes"
                  ? "bg-indigo-100 text-indigo-700 font-semibold border border-indigo-700"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
              }`}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
          </div>
        </div>

        {activeTab === "details" ? (
          <div className="space-y-6 w-full">
            <MilestoneProgress
              milestones={milestones}
              setMilestones={setMilestones}
              selectedPriority={selectedPriority}
            />
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
        ) : (
          <NotesView priorityId={selectedPriority.id} />
        )}
      </div>
    </div>
  );
};

export default PriorityView;
