import React, { useState, useEffect } from "react";
import TodoSection from "./TodoSection";
import MilestoneSection from "./MilestoneSection";
import DependencySection from "./DependencySection";
import Navigation from "./Navigation";
import PencilIcon from "./PencilIcon";
import {
  updatePriority,
  fetchTodos,
  fetchMilestones,
  fetchDependencies,
  fetchPriorities,
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
  const [priorities, setPriorities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    console.log(
      "PriorityView received new selectedPriority:",
      selectedPriority
    );
  }, [selectedPriority]);
  useEffect(() => {
    fetchPriorities().then((data) => {
      const activePriorities = data.filter((p) => !p.deleted && !p.completed);
      setPriorities(activePriorities);
    });
  }, []);

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

  const handleSelectPriority = (priority) => {
    setSelectedPriority(priority);
  };

  const handleGoHome = () => {
    setView("home");
  };

  if (!selectedPriority) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Navigation
        priorities={priorities}
        selectedPriority={selectedPriority}
        onSelectPriority={handleSelectPriority}
        onGoHome={handleGoHome}
        setView={setView}
      />

      <div className="bg-white shadow-md rounded-lg p-6">
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
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-blue-500 focus:outline-none"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-semibold">{selectedPriority.name}</h2>
          </div>
        )}

        <div className="flex gap-6">
          <div className="w-2/3">
            <TodoSection
              todos={todos}
              setTodos={setTodos}
              priorityId={selectedPriority.id}
            />
          </div>
          <div className="w-1/3 space-y-6">
            <MilestoneSection
              milestones={milestones}
              setMilestones={setMilestones}
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
    </div>
  );
};

export default PriorityView;
