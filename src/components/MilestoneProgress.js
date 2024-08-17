import React, { useState, useRef, useEffect } from "react";
import { updateMilestone, deleteMilestone, addMilestone } from "../utils/api";
import PlusIcon from "./PlusIcon";
import StandardModal from "./StandardModal";

const EditableField = ({ value, onUpdate, type = "text", className = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onUpdate(editValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          setIsEditing(false);
          onUpdate(editValue);
        }}
        onKeyDown={handleKeyDown}
        className={`border rounded px-2 py-1 ${className}`}
        style={{ color: "#1F2937" }}
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

const MilestoneProgress = ({ milestones, setMilestones, selectedPriority }) => {
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const lastMilestone = sortedMilestones[sortedMilestones.length - 1];
  const [contextMenu, setContextMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = lastMilestone ? calculateDaysLeft(lastMilestone.date) : 0;

  const getProjectStatus = () => {
    if (milestones.length === 0) {
      return { text: "Start planning your project", isSpecial: true };
    }
    const allCompleted = milestones.every((m) => m.status === "completed");
    if (allCompleted) {
      return { text: "All milestones complete", isSpecial: true };
    }
    return {
      number: daysLeft,
      text: "days left for this project",
      isSpecial: false,
    };
  };

  const projectStatus = getProjectStatus();

  const handleUpdateMilestone = async (milestone, field, value) => {
    const updatedMilestone = { ...milestone, [field]: value };
    const success = await updateMilestone(updatedMilestone);
    if (success) {
      const updatedMilestones = milestones.map((m) =>
        m.id === milestone.id ? updatedMilestone : m
      );
      setMilestones(updatedMilestones);
    } else {
      console.error("Failed to update milestone");
    }
  };

  const handleDeleteMilestone = async (milestone) => {
    const success = await deleteMilestone(milestone.id);
    if (success) {
      const updatedMilestones = milestones.filter((m) => m.id !== milestone.id);
      setMilestones(updatedMilestones);
    } else {
      console.error("Failed to delete milestone");
    }
  };

  const handleContextMenu = (e, milestone) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      milestone: milestone,
    });
  };

  const handleAddMilestone = async (data) => {
    if (data.title && data.date && selectedPriority) {
      const newMilestone = await addMilestone({
        ...data,
        status: "not started",
        priority_id: selectedPriority.id,
      });
      if (newMilestone) {
        setMilestones([...milestones, newMilestone]);
        setIsModalOpen(false);
      } else {
        console.error(
          "Unable to add milestone: missing title, date, or selected priority"
        );
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        {projectStatus.isSpecial ? (
          <div
            className={`${
              projectStatus.isSpecial
                ? "text-xl font-bold font-inter"
                : "text-3xl font-black"
            } text-gray-800 mr-2`}
            style={projectStatus.isSpecial ? { fontSize: "15px" } : {}}
          >
            <h3 className="text-xl font-bold font-inter">
              {projectStatus.text}
            </h3>
          </div>
        ) : (
          <div className="flex items-baseline">
            <span className="text-3xl font-black text-gray-800 mr-2">
              {projectStatus.number}
            </span>
            <span
              className="font-inter font-semibold text-gray-800"
              style={{ fontSize: "15px" }}
            >
              {projectStatus.text}
            </span>
          </div>
        )}
      </div>
      {milestones.length === 0 ? (
        <div className="flex rounded-lg overflow-hidden border-2 border-indigo-300 w-fit">
          <div
            className="h-20 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all duration-200 group px-6"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon className="w-6 h-6 text-indigo-700 group-hover:text-indigo-800" />
            <span className="text-sm font-medium text-indigo-700 group-hover:text-indigo-800 mt-1">
              Add milestone
            </span>
          </div>
        </div>
      ) : (
        <div className="flex rounded-lg overflow-hidden border-2 border-indigo-300">
          {sortedMilestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={`flex-grow h-20 max-w-xl ${
                milestone.status === "completed"
                  ? "bg-indigo-300"
                  : "bg-indigo-100"
              } flex flex-col items-center justify-center ${
                index !== sortedMilestones.length - 1
                  ? "border-r-2 border-gray-200"
                  : ""
              }`}
              onContextMenu={(e) => handleContextMenu(e, milestone)}
            >
              <div
                className={`font-semibold flex items-center ${
                  milestone.status === "completed"
                    ? "text-indigo-600"
                    : "text-gray-800"
                }`}
              >
                {milestone.status === "completed" && (
                  <svg
                    className="w-4 h-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                M{index + 1}
              </div>
              <EditableField
                value={milestone.title}
                onUpdate={(value) =>
                  handleUpdateMilestone(milestone, "title", value)
                }
                className={`text-xs mt-1 font-inter font-normal text-center ${
                  milestone.status === "completed"
                    ? "text-indigo-600"
                    : "text-gray-800"
                }`}
              />
              <EditableField
                value={milestone.date}
                onUpdate={(value) =>
                  handleUpdateMilestone(milestone, "date", value)
                }
                type="date"
                className={`text-xs mt-1 font-inter font-normal text-center ${
                  milestone.status === "completed"
                    ? "text-indigo-600"
                    : "text-gray-800"
                }`}
              />
            </div>
          ))}
          <div
            className="flex-grow h-20 max-w-xs bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all duration-200 group"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon className="w-6 h-6 text-indigo-700 group-hover:text-indigo-800" />
            <span className="text-sm font-medium text-indigo-700 group-hover:text-indigo-800 mt-1">
              Add milestone
            </span>
          </div>
        </div>
      )}
      {contextMenu && (
        <div
          className="context-menu fixed z-50"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          {contextMenu.milestone.status === "completed" ? (
            <button
              className="context-menu-item"
              onClick={() => {
                handleUpdateMilestone(
                  contextMenu.milestone,
                  "status",
                  "not started"
                );
                setContextMenu(null);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 10 3 4 21 4 21 10"></polyline>
                <line x1="3" y1="20" x2="21" y2="20"></line>
                <line x1="7" y1="20" x2="7" y2="10"></line>
                <line x1="17" y1="20" x2="17" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="10"></line>
              </svg>
              Mark as incomplete
            </button>
          ) : (
            <button
              className="context-menu-item"
              onClick={() => {
                handleUpdateMilestone(
                  contextMenu.milestone,
                  "status",
                  "completed"
                );
                setContextMenu(null);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Mark as complete
            </button>
          )}
          <button
            className="context-menu-item text-red-600"
            onClick={() => {
              handleDeleteMilestone(contextMenu.milestone);
              setContextMenu(null);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      )}
      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMilestone}
        title="Add New Milestone"
        fields={[
          {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
            placeholder: "Enter milestone title",
          },
          {
            name: "date",
            label: "Date",
            type: "date",
            required: true,
          },
        ]}
      />
    </div>
  );
};

export default MilestoneProgress;
