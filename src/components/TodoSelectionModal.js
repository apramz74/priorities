import React, { useState, useEffect } from "react";
import {
  fetchTodosForToday,
  updateTodoSelectedForToday,
  assignStartTimesAndDurations,
} from "../utils/api";

const TodoSelectionModal = ({
  isOpen,
  onClose,
  selectedTodos,
  setSelectedTodos,
}) => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchTodosForToday().then((fetchedTodos) => {
        // fetchedTodos now contains only incomplete and non-deleted todos
        setTodos(fetchedTodos);
        setSelectedTodos(
          fetchedTodos.filter((todo) => todo.selected_for_today)
        );
      });
    }
  }, [isOpen, setSelectedTodos]);

  const handleTodoSelect = async (todo) => {
    const isSelected = selectedTodos.some((t) => t.id === todo.id);
    const updatedTodo = await updateTodoSelectedForToday(todo.id, !isSelected);

    if (updatedTodo) {
      setSelectedTodos((prev) => {
        const newSelectedTodos = isSelected
          ? prev.filter((t) => t.id !== todo.id)
          : [...prev, updatedTodo];
        return newSelectedTodos;
      });
      assignStartTimesAndDurations(updatedTodo);
      setTodos((prev) =>
        prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
      );
    }
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
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TodoSelectionModal;
