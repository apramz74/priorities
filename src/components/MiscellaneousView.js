import React, { useState, useEffect } from "react";
import Table from "./Table";
import Navigation from "./Navigation";
import {
  fetchMiscTodos,
  addTodo,
  updateTodo,
  toggleDeleted,
  toggleComplete,
  fetchPriorities,
} from "../utils/api";
import PlusIcon from "./PlusIcon";

const MiscellaneousView = ({ setView, setSelectedPriority }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ name: "", due_date: "", notes: "" });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [priorities, setPriorities] = useState([]);

  useEffect(() => {
    fetchPriorities().then((data) => {
      const activePriorities = data.filter((p) => !p.deleted && !p.completed);
      setPriorities(activePriorities);
    });
  }, []);

  const loadTodos = React.useCallback(async () => {
    const fetchedTodos = await fetchMiscTodos(showCompleted);
    setTodos(fetchedTodos);
  }, [showCompleted]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAddTodo = async () => {
    if (newTodo.name.trim() && newTodo.due_date) {
      const todo = await addTodo({
        ...newTodo,
        priority_id: -999999,
      });
      if (todo) {
        setTodos([...todos, todo]);
        setNewTodo({ name: "", due_date: "", notes: "" });
        setIsFormVisible(false);
      }
    }
  };

  const handleUpdateTodo = async (id, field, value) => {
    const updatedTodo = { ...todos.find((t) => t.id === id), [field]: value };
    const result = await updateTodo(updatedTodo);
    if (result) {
      setTodos(todos.map((t) => (t.id === result.id ? result : t)));
    }
  };

  const handleToggleComplete = async (id) => {
    const todo = todos.find((t) => t.id === id);
    const success = await toggleComplete("todos", id, !todo.completed);
    if (success) {
      await loadTodos();
    }
  };

  const handleToggleDeleted = async (id) => {
    const success = await toggleDeleted("todos", id, true);
    if (success) {
      await loadTodos();
    }
  };

  const handleSelectPriority = (priority) => {
    setSelectedPriority(priority);
    setView("priority");
  };

  const handleGoHome = () => {
    setView("home");
  };

  const columns = [
    { field: "name", header: "Task", sortable: true, editable: true },
    {
      field: "due_date",
      header: "Due date",
      sortable: true,
      editable: true,
      type: "date",
    },
    { field: "notes", header: "Note", sortable: true, editable: true },
  ];

  return (
    <div className="space-y-6">
      <Navigation
        priorities={priorities}
        selectedPriority={null}
        onSelectPriority={handleSelectPriority}
        onGoHome={handleGoHome}
        setView={setView}
      />

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Miscellaneous To-Do List
        </h2>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="text-gray-400 hover:text-blue-500 focus:outline-none"
          >
            <PlusIcon />
          </button>
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
          <div className="mb-4 space-y-2">
            <input
              type="text"
              value={newTodo.name}
              onChange={(e) => setNewTodo({ ...newTodo, name: e.target.value })}
              className="w-full border rounded px-2 py-1"
              placeholder="Task name"
            />
            <input
              type="date"
              value={newTodo.due_date}
              onChange={(e) =>
                setNewTodo({ ...newTodo, due_date: e.target.value })
              }
              className="w-full border rounded px-2 py-1"
            />
            <textarea
              value={newTodo.notes}
              onChange={(e) =>
                setNewTodo({ ...newTodo, notes: e.target.value })
              }
              className="w-full border rounded px-2 py-1"
              placeholder="Notes"
              rows="3"
            />
            <button
              onClick={handleAddTodo}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
            >
              Add Task
            </button>
          </div>
        )}
        <Table
          data={todos}
          columns={columns}
          onUpdate={handleUpdateTodo}
          onDelete={handleToggleDeleted}
          onToggleComplete={handleToggleComplete}
        />
      </div>
    </div>
  );
};

export default MiscellaneousView;
