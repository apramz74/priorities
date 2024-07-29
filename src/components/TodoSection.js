import React, { useState, useEffect, useCallback } from "react";
import {
  addTodo,
  updateTodo,
  toggleDeleted,
  toggleComplete,
  fetchTodos,
} from "../utils/api";
import Table from "./Table";
import PlusIcon from "./PlusIcon";

const TodoSection = ({ priorityId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ name: "", due_date: "", notes: "" });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const loadTodos = useCallback(async () => {
    const fetchedTodos = await fetchTodos(priorityId, showCompleted);
    setTodos(fetchedTodos);
  }, [priorityId, showCompleted]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAddTodo = async () => {
    if (newTodo.name.trim() && newTodo.due_date) {
      const todo = await addTodo({
        ...newTodo,
        priority_id: priorityId,
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

  const columns = [
    { field: "name", header: "Task" },
    { field: "due_date", header: "Due Date" },
    { field: "notes", header: "Notes" },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">To-do List</h3>
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
            onChange={(e) => setNewTodo({ ...newTodo, notes: e.target.value })}
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
      {todos.length > 0 ? (
        <Table
          data={todos}
          columns={columns}
          onUpdate={handleUpdateTodo}
          onDelete={handleToggleDeleted}
          onToggleComplete={handleToggleComplete}
        />
      ) : (
        <p className="text-gray-500 italic p-4">
          {showCompleted ? "No completed tasks." : "No active tasks."}
        </p>
      )}
    </div>
  );
};

export default TodoSection;
