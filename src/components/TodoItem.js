import React from "react";
import { ReactComponent as CompletedCheckmark } from "./completed_checkmark.svg";
import { ReactComponent as PendingIcon } from "./pending_icon.svg";

const TodoItem = ({ todo, isSelected, onSelect, onDeselect }) => {
  const isCompleted = !!todo.completed_at;

  // Add this function to format the date
  const formatCompletedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const fullTodoInfo = isCompleted
    ? `${todo.name} (Completed: ${formatCompletedDate(todo.completed_at)})`
    : todo.name;

  return (
    <div
      className={`flex items-center justify-between w-full p-1 pr-2 pl-2 rounded-md ${
        isSelected ? "border-2 border-indigo-500" : ""
      }`}
    >
      <div className="flex items-center flex-grow min-w-0 mr-2">
        {isCompleted ? (
          <CompletedCheckmark className="w-4 h-4 text-green-500 flex-shrink-0 mr-2" />
        ) : (
          <PendingIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mr-2" />
        )}
        <span
          className="truncate text-xs mr-2 flex-grow group relative"
          title={fullTodoInfo}
        >
          {todo.name}
          {isCompleted && (
            <span className="ml-1 text-gray-400">
              ({formatCompletedDate(todo.completed_at)})
            </span>
          )}
          <span className="invisible group-hover:visible absolute left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
            {fullTodoInfo}
          </span>
        </span>
      </div>
      <div className="flex-shrink-0">
        {isSelected ? (
          <div className="flex items-center">
            <span className="text-xs text-gray-400 mr-2">
              Added to update ›
            </span>
            <button
              onClick={onDeselect}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={isCompleted ? onSelect : undefined}
            className={`text-xs px-3 py-1 rounded border ${
              isCompleted
                ? "text-gray-400 hover:text-gray-600 border-gray-300"
                : "text-gray-300 border-gray-200 cursor-not-allowed"
            }`}
            title={isCompleted ? "" : "Must be complete to include"}
          >
            Include
          </button>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
