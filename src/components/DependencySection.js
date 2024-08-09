import React, { useState, useEffect } from "react";
import {
  addDependency,
  updateDependency,
  toggleDeleted,
  toggleComplete,
  fetchDependencies,
} from "../utils/api";
import ItemComponent from "./ItemComponent";
import { ReactComponent as PlusIcon } from "./plus_icon.svg";

const DependencySection = ({ priorityId }) => {
  const [dependencies, setDependencies] = useState([]);
  const [newDependency, setNewDependency] = useState({
    title: "",
    person: "",
    due_date: "",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const loadDependencies = React.useCallback(async () => {
    const fetchedDependencies = await fetchDependencies(
      priorityId,
      showCompleted
    );
    const sortedDependencies = fetchedDependencies.sort(
      (a, b) => new Date(a.due_date) - new Date(b.due_date)
    );
    setDependencies(sortedDependencies);
  }, [priorityId, showCompleted]);

  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  const handleAddDependency = async () => {
    if (newDependency.title && newDependency.person && newDependency.due_date) {
      const dependency = await addDependency({
        ...newDependency,
        priority_id: priorityId,
      });
      if (dependency) {
        setDependencies((prevDependencies) => {
          const updatedDependencies = [...prevDependencies, dependency];
          return updatedDependencies.sort(
            (a, b) => new Date(a.due_date) - new Date(b.due_date)
          );
        });
        setNewDependency({ title: "", person: "", due_date: "" });
        setIsFormVisible(false);
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
      setDependencies((prevDependencies) => {
        const updatedDependencies = prevDependencies.map((d) =>
          d.id === result.id ? result : d
        );
        return updatedDependencies.sort(
          (a, b) => new Date(a.due_date) - new Date(b.due_date)
        );
      });
    }
  };

  const handleToggleComplete = async (id) => {
    const dependency = dependencies.find((d) => d.id === id);
    const success = await toggleComplete(
      "dependencies",
      id,
      !dependency.completed
    );
    if (success) {
      loadDependencies();
    }
  };

  const handleToggleDeleted = async (id) => {
    const success = await toggleDeleted("dependencies", id, true);
    if (success) {
      await loadDependencies();
    }
  };

  const handleToggleShowCompleted = async () => {
    setShowCompleted((prev) => !prev);
  };

  useEffect(() => {
    loadDependencies();
  }, [showCompleted, loadDependencies]);

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold mr-2">Dependencies</h3>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-600 mr-2">Show completed</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              showCompleted ? "bg-blue-500" : "bg-gray-300"
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
      <div className="space-y-2">
        {dependencies.map((dependency) => (
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
      {isFormVisible && (
        <div className="mt-4 space-y-2">
          <input
            type="text"
            value={newDependency.title}
            onChange={(e) =>
              setNewDependency({ ...newDependency, title: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
            placeholder="Dependency title"
          />
          <input
            type="text"
            value={newDependency.person}
            onChange={(e) =>
              setNewDependency({ ...newDependency, person: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
            placeholder="Person responsible"
          />
          <input
            type="date"
            value={newDependency.due_date}
            onChange={(e) =>
              setNewDependency({ ...newDependency, due_date: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
          />
          <button
            onClick={handleAddDependency}
            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
          >
            Add Dependency
          </button>
        </div>
      )}
    </div>
  );
};

export default DependencySection;
