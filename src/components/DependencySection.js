import React, { useState, useEffect } from "react";
import {
  addDependency,
  updateDependency,
  toggleDeleted,
  toggleComplete,
  fetchDependencies,
} from "../utils/api";
import Table from "./Table";
import PlusIcon from "./PlusIcon";

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
    setDependencies(fetchedDependencies);
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
        setDependencies([...dependencies, dependency]);
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
      setDependencies(
        dependencies.map((d) => (d.id === result.id ? result : d))
      );
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
      await loadDependencies();
    }
  };

  const handleToggleDeleted = async (id) => {
    const success = await toggleDeleted("dependencies", id, true);
    if (success) {
      await loadDependencies();
    }
  };

  const columns = [
    { field: "title", header: "Account", sortable: true, editable: true },
    { field: "person", header: "Person", sortable: true, editable: true },
    {
      field: "due_date",
      header: "Due date",
      sortable: true,
      editable: true,
      type: "date",
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Dependencies</h3>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="text-gray-400 hover:text-blue-500 focus:outline-none"
          >
            <PlusIcon />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show completed</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              showCompleted ? "bg-blue-500" : "bg-gray-300"
            }`}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                showCompleted ? "translate-x-6" : ""
              }`}
            ></div>
          </div>
        </div>
      </div>
      {isFormVisible && (
        <div className="p-4 space-y-2">
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
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Add Dependency
          </button>
        </div>
      )}
      {dependencies.length > 0 ? (
        <Table
          data={dependencies}
          columns={columns}
          onUpdate={handleUpdateDependency}
          onDelete={handleToggleDeleted}
          onToggleComplete={handleToggleComplete}
        />
      ) : (
        <p className="text-gray-500 italic p-4">
          {showCompleted
            ? "No completed dependencies."
            : "No active dependencies."}
        </p>
      )}
    </div>
  );
};

export default DependencySection;
