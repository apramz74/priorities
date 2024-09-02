import React, { useState, useEffect } from "react";
import {
  fetchSelectedTodosForToday,
  updateTodoSelectedForToday,
} from "../utils/api";

const TodoSelectionModal = ({ isOpen, onClose, onTodosSelected }) => {
  const [todos, setTodos] = useState([]);
  const [selectedTodos, setSelectedTodos] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchSelectedTodosForToday().then((fetchedTodos) => {
        // fetchedTodos now contains only incomplete and non-deleted todos
        setTodos(fetchedTodos);
        setSelectedTodos(
          fetchedTodos.filter((todo) => todo.selected_for_today)
        );
      });
    }
  }, [isOpen]);

  const handleTodoSelect = async (todo) => {
    const isSelected = selectedTodos.some((t) => t.id === todo.id);
    const updatedTodo = await updateTodoSelectedForToday(todo.id, !isSelected);
    if (updatedTodo) {
      setSelectedTodos((prev) =>
        isSelected
          ? prev.filter((t) => t.id !== todo.id)
          : [...prev, updatedTodo]
      );
      // Update the todo in the todos state as well
      setTodos((prev) =>
        prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
      );
    }
  };

  const handleSave = () => {
    onTodosSelected(selectedTodos);
    onClose();
  };

  const renderTodoGroup = (groupName, groupTodos) => (
    <div key={groupName} className="mb-4">
      <h4 className="text-md font-medium text-gray-700 mb-2 capitalize">
        {groupName === "dueToday" ? "Due Today" : groupName} Todos
      </h4>
      {groupTodos.map((todo) => (
        <div key={todo.id} className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={selectedTodos.some((t) => t.id === todo.id)}
            onChange={() => handleTodoSelect(todo)}
            className="mr-2"
          />
          <span>{todo.name}</span>
        </div>
      ))}
    </div>
  );

  const groupedTodos = todos.reduce((acc, todo) => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
    let key;
    if (todo.due_date < today) key = "overdue";
    else if (todo.due_date === today) key = "dueToday";
    else key = "upcoming";

    if (!acc[key]) acc[key] = [];
    acc[key].push(todo);
    return acc;
  }, {});

  return (
    <div
      className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Select Todos for Today
        </h3>
        {renderTodoGroup("overdue", groupedTodos.overdue || [])}
        {renderTodoGroup("dueToday", groupedTodos.dueToday || [])}
        {renderTodoGroup("upcoming", groupedTodos.upcoming || [])}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoSelectionModal;
