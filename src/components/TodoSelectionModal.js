import React, { useState, useEffect } from "react";
import {
  updateTodoSelectedForToday,
  assignStartTimesAndDurations,
} from "../utils/api";

const TodoSelectionModal = ({
  isOpen,
  onClose,
  selectedTodos,
  setSelectedTodos,
  priorities, // Add this prop
  allTodos,
  onTodoUpdate,
}) => {
  const [todos, setTodos] = useState([]);
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    if (isOpen) {
      setTodos(allTodos);
      setSelectedTodos(allTodos.filter((todo) => todo.selected_for_today));
    }
  }, [isOpen, allTodos, setSelectedTodos]);

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = Math.abs(today - due);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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
      onTodoUpdate(); // Trigger update in parent component
    }
  };

  const groupTodosByPriority = (todos) => {
    const groupedTodos = todos.reduce((acc, todo) => {
      const priorityId = todo.priority_id || "miscellaneous";
      if (!acc[priorityId]) acc[priorityId] = [];
      acc[priorityId].push(todo);
      return acc;
    }, {});

    // Sort priorities based on their order in the Navigation component
    const sortedPriorities = priorities.sort((a, b) => a.order - b.order);

    // Create an array of [priorityId, todos] pairs in the correct order, only for priorities with todos
    const sortedGroupedTodos = sortedPriorities
      .map((priority) => [priority.id, groupedTodos[priority.id] || []])
      .filter(([_, todos]) => todos.length > 0);

    // Add miscellaneous todos at the end if they exist
    if (groupedTodos.miscellaneous && groupedTodos.miscellaneous.length > 0) {
      sortedGroupedTodos.push(["miscellaneous", groupedTodos.miscellaneous]);
    }

    return sortedGroupedTodos;
  };

  const renderTodoList = (groupTodos) => (
    <div>
      {groupTodosByPriority(groupTodos).map(([priorityId, todos]) => (
        <div key={priorityId} className="mb-4">
          <h5 className="text-gray-700 font-medium text-sm mb-2">
            {priorityId === "miscellaneous"
              ? "Miscellaneous"
              : priorities.find((p) => p.id === priorityId)?.name ||
                "Unknown Priority"}
          </h5>
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center mb-2 ml-4">
              <input
                type="checkbox"
                checked={selectedTodos.some((t) => t.id === todo.id)}
                onChange={() => handleTodoSelect(todo)}
                className="indigo-checkbox mr-3"
              />
              <span className="text-sm text-gray-700">
                {todo.name}
                {activeTab === "overdue" && (
                  <span className="text-red-400 text-sm ml-1">
                    ({getDaysOverdue(todo.due_date)} days overdue)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      ))}
      {groupTodosByPriority(groupTodos).length === 0 && (
        <p>No todos available for this category.</p>
      )}
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
    else if (todo.due_date === today) key = "today";
    else key = "upcoming";

    if (!acc[key]) acc[key] = [];
    acc[key].push(todo);
    return acc;
  }, {});

  const tabContent = {
    overdue: groupedTodos.overdue || [],
    today: groupedTodos.today || [],
    upcoming: groupedTodos.upcoming || [],
  };

  const getTabCounts = (tab) => {
    const totalCount = tabContent[tab].length;
    const selectedCount = tabContent[tab].filter((todo) =>
      selectedTodos.some((selectedTodo) => selectedTodo.id === todo.id)
    ).length;
    return `${selectedCount}/${totalCount}`;
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="gradient-background rounded-lg shadow-xl w-full max-w-xl">
        <div className="modal-content bg-white m-2 p-6 rounded-lg relative">
          <h3 className="text-xl font-bold mb-4">
            What are you working on today?
          </h3>
          <div className="flex border-b mb-4">
            {Object.keys(tabContent).map((tab) => (
              <button
                key={tab}
                className={`py-1 px-4 flex items-center ${
                  activeTab === tab
                    ? "border-b-2 border-indigo-500 text-indigo-700 font-semibold text-sm"
                    : "text-gray-500 text-sm"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="mr-2">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
                <span className="text-xs bg-gray-200 rounded-full px-2 py-1">
                  {getTabCounts(tab)}
                </span>
              </button>
            ))}
          </div>
          {renderTodoList(tabContent[activeTab])}
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
    </div>
  );
};

export default TodoSelectionModal;
