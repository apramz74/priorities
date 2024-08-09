import React, { useState, useEffect } from "react";
import TodoSection from "./TodoSection";
import MilestoneProgress from "./MilestoneProgress";
import DependencySection from "./DependencySection";
import { ReactComponent as PencilIcon } from "./pencil_icon.svg";
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

  if (!selectedPriority) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-grow">
      <div className="p-6">
        {isEditing ? (
          <div className="flex items-center space-x-2 mb-4">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black">{selectedPriority.name}</h2>
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-blue-500 focus:outline-none"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        <MilestoneProgress milestones={milestones} />

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
