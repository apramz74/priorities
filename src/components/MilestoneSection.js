import React, { useState, useMemo } from "react";
import { addMilestone, updateMilestone, deleteMilestone } from "../utils/api";
import PlusIcon from "./PlusIcon";
import PencilIcon from "./PencilIcon";
import {
  CheckIcon,
  ClockIcon,
  NotStartedIcon,
  BlockedIcon,
  DeleteIcon,
} from "./MilestoneIcons";

const MilestoneSection = ({ milestones, setMilestones, priorityId }) => {
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    date: "",
    status: "not started",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  const handleAddMilestone = async () => {
    if (newMilestone.title && newMilestone.date) {
      const milestone = await addMilestone({
        ...newMilestone,
        priority_id: priorityId,
      });
      if (milestone) {
        setMilestones([...milestones, milestone]);
        setNewMilestone({ title: "", date: "", status: "not started" });
        setIsFormVisible(false);
      }
    }
  };

  const handleUpdateMilestone = async (updatedMilestone) => {
    const result = await updateMilestone(updatedMilestone);
    if (result) {
      setMilestones(
        milestones.map((m) =>
          m.id === updatedMilestone.id ? updatedMilestone : m
        )
      );
      setEditingMilestone(null);
    }
  };

  const handleDeleteMilestone = async (id) => {
    const result = await deleteMilestone(id);
    if (result) {
      setMilestones(milestones.filter((m) => m.id !== id));
    } else {
      console.error("Failed to delete milestone");
    }
  };

  const getStatusIconAndText = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          icon: <CheckIcon className="w-6 h-6" />,
          text: "Completed",
          colorClass: "text-green-500 bg-green-100",
        };
      case "in progress":
        return {
          icon: <ClockIcon className="w-6 h-6" />,
          text: "In Progress",
          colorClass: "text-blue-500 bg-blue-100",
        };
      case "not started":
        return {
          icon: <NotStartedIcon className="w-6 h-6" />,
          text: "Not Started",
          colorClass: "text-gray-500 bg-gray-100",
        };
      case "blocked":
        return {
          icon: <BlockedIcon className="w-6 h-6" />,
          text: "Blocked",
          colorClass: "text-red-500 bg-red-100",
        };
      default:
        return {
          icon: <NotStartedIcon className="w-6 h-6" />,
          text: "Not Started",
          colorClass: "text-gray-500 bg-gray-100",
        };
    }
  };

  const calculateDaysDifference = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const DaysBadge = ({ days }) => {
    const textClass = days < 0 ? "text-red-500" : "text-gray-500";
    const text =
      days < 0 ? `(${Math.abs(days)} days overdue)` : `(${days} days left)`;
    return <span className={`${textClass} text-sm ml-2`}>{text}</span>;
  };

  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [milestones]);

  const renderMilestone = (milestone, index) => {
    if (editingMilestone && editingMilestone.id === milestone.id) {
      return (
        <li key={milestone.id} className="flex flex-col space-y-2 py-2 pl-8">
          <input
            type="text"
            value={editingMilestone.title}
            onChange={(e) =>
              setEditingMilestone({
                ...editingMilestone,
                title: e.target.value,
              })
            }
            className="w-full border rounded px-2 py-1"
          />
          <div className="flex space-x-2">
            <input
              type="date"
              value={editingMilestone.date}
              onChange={(e) =>
                setEditingMilestone({
                  ...editingMilestone,
                  date: e.target.value,
                })
              }
              className="flex-grow border rounded px-2 py-1"
            />
            <select
              value={editingMilestone.status}
              onChange={(e) =>
                setEditingMilestone({
                  ...editingMilestone,
                  status: e.target.value,
                })
              }
              className="flex-grow border rounded px-2 py-1"
            >
              <option value="not started">Not Started</option>
              <option value="in progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handleUpdateMilestone(editingMilestone)}
              className="bg-green-500 text-white px-2 py-1 rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setEditingMilestone(null)}
              className="bg-gray-300 text-black px-2 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </li>
      );
    }

    const daysDifference = calculateDaysDifference(milestone.date);
    const { icon, text, colorClass } = getStatusIconAndText(milestone.status);

    return (
      <li
        key={milestone.id}
        className="relative pl-8 py-4 border-l-2 border-gray-200"
      >
        <div
          className={`absolute left-0 top-5 -ml-3 ${
            index === 0 ? "bg-white" : ""
          }`}
        >
          <div className={`rounded-full p-1 ${colorClass}`}>{icon}</div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-lg">{milestone.title}</span>
              <span
                className={`text-sm px-2 py-0.5 rounded-full ${colorClass}`}
              >
                {text}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingMilestone(milestone)}
                className="text-gray-400 hover:text-blue-500 focus:outline-none"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteMilestone(milestone.id)}
                className="text-gray-400 hover:text-red-500 focus:outline-none"
              >
                <DeleteIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-1 flex items-center">
            {new Date(milestone.date).toLocaleDateString()}
            <DaysBadge days={daysDifference} />
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex items-center space-x-2 mb-4">
        <h3 className="text-lg font-semibold">Milestones</h3>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="text-gray-400 hover:text-blue-500 focus:outline-none"
        >
          <PlusIcon />
        </button>
      </div>
      {isFormVisible && (
        <div className="space-y-2 mb-4">
          <input
            type="text"
            value={newMilestone.title}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, title: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
            placeholder="Milestone title"
          />
          <input
            type="date"
            value={newMilestone.date}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, date: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
          />
          <select
            value={newMilestone.status}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, status: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
          >
            <option value="not started">Not Started</option>
            <option value="in progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={handleAddMilestone}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Add Milestone
          </button>
        </div>
      )}
      {sortedMilestones.length > 0 ? (
        <ul className="space-y-0">
          {sortedMilestones.map((milestone, index) =>
            renderMilestone(milestone, index)
          )}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No milestones added yet.</p>
      )}
    </div>
  );
};

export default MilestoneSection;
