import React, { useState } from "react";
import {
  addDependency,
  updateDependency,
  toggleDeleted,
  toggleComplete,
  fetchDependencies,
} from "../utils/api";
import ItemComponent from "./ItemComponent";
import { ReactComponent as PlusIcon } from "./plus_icon.svg";
import StandardModal from "./StandardModal";
import { ReactComponent as EmptyStateIcon } from "./empty_state.svg";

const DependencySection = ({ priorityId, dependencies, setDependencies }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const handleAddDependency = async (data) => {
    const newDependency = await addDependency({
      ...data,
      priority_id: priorityId,
    });
    if (newDependency) {
      setDependencies([...dependencies, newDependency]);
      setIsModalOpen(false);
    }
  };

  const handleToggleComplete = async (id) => {
    const item = dependencies.find((dependency) => dependency.id === id);
    if (item) {
      const newCompletedStatus = !item.completed;
      const success = await toggleComplete(
        "dependencies",
        id,
        newCompletedStatus
      );
      if (success) {
        setDependencies(
          dependencies.map((dependency) =>
            dependency.id === id
              ? { ...dependency, completed: newCompletedStatus }
              : dependency
          )
        );
      }
    }
  };

  const handleUpdateDependency = async (id, field, value) => {
    const updatedDependency = {
      ...dependencies.find((d) => d.id === id),
      [field]: value,
    };
    const result = await updateDependency(updatedDependency);
    if (result) {
      setDependencies(
        dependencies.map((d) => (d.id === result.id ? result : d))
      );
    }
  };

  const handleToggleDeleted = async (id) => {
    const success = await toggleDeleted("dependencies", id, true);
    if (success) {
      const updatedDependencies = await fetchDependencies(priorityId);
      setDependencies(updatedDependencies);
    }
  };

  const handleToggleShowCompleted = async () => {
    setShowCompleted((prev) => !prev);
    const updatedDependencies = await fetchDependencies(
      priorityId,
      !showCompleted
    );
    setDependencies(updatedDependencies);
  };

  const filteredDependencies = showCompleted
    ? dependencies
    : dependencies.filter((dependency) => !dependency.completed);

  const sortedDependencies = filteredDependencies.sort(
    (a, b) => new Date(a.due_date) - new Date(b.due_date)
  );

  const dependencyFields = [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "Enter dependency title",
    },
    {
      name: "person",
      label: "Person",
      type: "text",
      required: true,
      placeholder: "Enter person responsible",
    },
    { name: "due_date", label: "Due Date", type: "date", required: true },
  ];

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mr-2">Dependencies</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-600 mr-2">Show completed</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              showCompleted ? "bg-indigo-600" : "bg-gray-300"
            }`}
            onClick={handleToggleShowCompleted}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                showCompleted ? "translate-x-6" : ""
              }`}
            ></div>
          </div>
        </div>
      </div>
      {sortedDependencies.length > 0 ? (
        <div className="space-y-2">
          {sortedDependencies.map((dependency) => (
            <ItemComponent
              key={dependency.id}
              item={dependency}
              onToggleComplete={handleToggleComplete}
              onUpdate={handleUpdateDependency}
              onDelete={handleToggleDeleted}
              borderColor="border-gray-200"
              itemType="dependency"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <EmptyStateIcon className="w-32 h-32" />
          <p className="text-gray-500 font-inter text-sm">
            No dependencies yet
          </p>
        </div>
      )}
      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddDependency}
        title="Add New Dependency"
        fields={dependencyFields}
      />
    </div>
  );
};

export default DependencySection;
