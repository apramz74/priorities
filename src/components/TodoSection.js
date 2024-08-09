import React, { useState, useEffect, useCallback } from "react";
import {
  addTodo,
  updateTodo,
  toggleDeleted,
  toggleComplete,
  fetchTodos,
} from "../utils/api";
import { ReactComponent as PlusIcon } from "./plus_icon.svg";
import ItemComponent from "./ItemComponent";

const TodoSection = ({ priorityId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ name: "", due_date: "", notes: "" });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const loadTodos = useCallback(async () => {
    const fetchedTodos = await fetchTodos(priorityId, showCompleted);
    const sortedTodos = fetchedTodos.sort(
      (a, b) => new Date(a.due_date) - new Date(b.due_date)
    );
    setTodos(sortedTodos);
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
        setTodos((prevTodos) => {
          const updatedTodos = [...prevTodos, todo];
          return updatedTodos.sort(
            (a, b) => new Date(a.due_date) - new Date(b.due_date)
          );
        });
        setNewTodo({ name: "", due_date: "", notes: "" });
        setIsFormVisible(false);
      }
    }
  };

  const handleUpdateTodo = async (id, field, value) => {
    const updatedTodo = { ...todos.find((t) => t.id === id), [field]: value };
    const result = await updateTodo(updatedTodo);
    if (result) {
      setTodos((prevTodos) => {
        const updatedTodos = prevTodos.map((t) =>
          t.id === result.id ? result : t
        );
        return updatedTodos.sort(
          (a, b) => new Date(a.due_date) - new Date(b.due_date)
        );
      });
    }
  };

  const handleToggleComplete = async (id) => {
    const todo = todos.find((t) => t.id === id);
    const success = await toggleComplete("todos", id, !todo.completed);
    if (success) {
      loadTodos();
    }
  };

  const handleToggleDeleted = async (id) => {
    const success = await toggleDeleted("todos", id, true);
    if (success) {
      loadTodos();
    }
  };

  const handleToggleShowCompleted = async () => {
    setShowCompleted((prev) => !prev);
  };

  useEffect(() => {
    loadTodos();
  }, [showCompleted, loadTodos]);

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-bold mr-2">To Do</h3>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="text-purple-600 hover:text-purple-800 focus:outline-none"
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
        {todos.map((todo) => (
          <ItemComponent
            key={todo.id}
            item={todo}
            onToggleComplete={handleToggleComplete}
            onUpdate={handleUpdateTodo}
            onDelete={handleToggleDeleted}
            borderColor="border-indigo-800 border-2"
            itemType="todo"
          />
        ))}
      </div>
      {isFormVisible && (
        <div className="mt-4 space-y-2">
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
            className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
          >
            Add Task
          </button>
        </div>
      )}
    </div>
  );
};

export default TodoSection;
