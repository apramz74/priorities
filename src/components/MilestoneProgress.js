import React, { useState, useEffect, useMemo } from "react";
import { updateMilestone, deleteMilestone, addMilestone } from "../utils/api";
import StandardModal from "./StandardModal";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

const MilestoneProgress = ({ milestones, setMilestones, selectedPriority }) => {
  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [milestones]
  );
  const [contextMenu, setContextMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  const calculateDaysLeft = () => {
    const today = new Date();
    const nextMilestone = sortedMilestones.find(
      (m) => new Date(m.date) > today && m.status !== "completed"
    );
    if (!nextMilestone) return 0;

    const diffTime = new Date(nextMilestone.date) - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft();
  console.log(milestones);
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
      text:
        daysLeft === 1
          ? "day until next milestone"
          : "days until next milestone",
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
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      x: rect.right,
      y: rect.bottom,
      milestone: milestone,
    });
  };

  const handleAddMilestone = async (data) => {
    if (data.title && data.date && selectedPriority) {
      const newMilestone = await addMilestone({
        ...data,
        date: new Date(data.date + "T00:00:00Z").toISOString().split("T")[0], // Ensure UTC date
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

  const handleEditMilestone = async (data) => {
    if (data.title && data.date && editingMilestone) {
      const updatedMilestone = {
        ...editingMilestone,
        title: data.title,
        date: new Date(data.date + "T00:00:00Z").toISOString().split("T")[0], // Ensure UTC date
      };
      const success = await updateMilestone(updatedMilestone);
      if (success) {
        setMilestones((prevMilestones) =>
          prevMilestones.map((m) =>
            m.id === updatedMilestone.id ? updatedMilestone : m
          )
        );
        setIsModalOpen(false);
        setEditingMilestone(null);
      } else {
        console.error("Failed to update milestone");
      }
    }
  };

  const openEditModal = (milestone) => {
    setEditingMilestone(milestone);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00"); // Add time to ensure correct date
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      timeZone: "UTC", // Ensure the date is interpreted as UTC
    });
  };

  const getCurrentMilestone = () => {
    const today = new Date();
    return sortedMilestones.find(
      (m) => new Date(m.date) >= today && m.status !== "completed"
    );
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        {projectStatus.isSpecial ? (
          <h3 className="text-xl font-bold font-inter text-gray-800">
            {projectStatus.text}
          </h3>
        ) : (
          <div className="flex items-baseline">
            <span className="text-3xl font-black text-indigo-deep mr-2">
              {projectStatus.number}
            </span>
            <span className="font-inter font-semibold text-gray-800 text-sm">
              {projectStatus.text}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-start space-x-1 mb-2">
        {sortedMilestones.map((milestone, index) => (
          <div key={milestone.id} className="flex-1">
            <div className="relative">
              <div
                className={`h-2 w-full ${
                  milestone.status === "completed"
                    ? "bg-indigo-deep"
                    : "bg-indigo-100"
                } ${index === 0 ? "rounded-l-md" : ""} ${
                  index === sortedMilestones.length - 1 ? "rounded-r-md" : ""
                }`}
              ></div>
              <div className="absolute -bottom-6 left-0 w-full flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1">
                  <span
                    className={`font-medium  ${
                      milestone.status === "completed"
                        ? "text-gray-400 line-through"
                        : "text-gray-600"
                    } ${
                      milestone === getCurrentMilestone() &&
                      "text-indigo-deep font-bold"
                    }`}
                  >
                    M{index + 1}
                  </span>
                  <span
                    className={`font-medium ${
                      milestone.status === "completed"
                        ? "text-gray-400 line-through"
                        : "text-gray-600"
                    } ${
                      milestone === getCurrentMilestone() &&
                      "text-indigo-deep font-bold"
                    }`}
                  >
                    {formatDate(milestone.date)}
                  </span>
                  <span>
                    {milestone.status === "completed" && (
                      <span className="text-indigo-deep font-bold">✓</span>
                    )}
                  </span>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => handleContextMenu(e, milestone)}
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-5">
              <span
                className={`text-xs ${
                  milestone.status === "completed"
                    ? "text-gray-400 line-through"
                    : "text-gray-800"
                }`}
              >
                {milestone.title}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button
        className="text-indigo-deep text-sm font-medium hover:text-indigo-700 flex items-center"
        onClick={() => setIsModalOpen(true)}
      >
        Add milestone →
      </button>
      {contextMenu && (
        <div
          className="context-menu fixed z-50 bg-white shadow-lg rounded-md py-1"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            transform: "translate(0, 8px)",
          }}
        >
          <button
            className="context-menu-item"
            onClick={() => {
              openEditModal(contextMenu.milestone);
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingMilestone(null);
        }}
        onSubmit={editingMilestone ? handleEditMilestone : handleAddMilestone}
        title={editingMilestone ? "Edit Milestone" : "Add New Milestone"}
        fields={[
          {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
            placeholder: "Enter milestone title",
            defaultValue: editingMilestone ? editingMilestone.title : "",
          },
          {
            name: "date",
            label: "Date",
            type: "date",
            required: true,
            defaultValue: editingMilestone
              ? editingMilestone.date.split("T")[0]
              : "",
          },
        ]}
      />
    </div>
  );
};

export default MilestoneProgress;
