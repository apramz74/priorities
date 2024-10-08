import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAllTodosWithPriorities,
  calculateTodoCounts,
  toggleComplete,
} from "../utils/api";
import ItemComponent from "./ItemComponent";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const DailyPlanView = ({ priorities, setSelectedPriority, setView }) => {
  const [todos, setTodos] = useState([]);
  const [totalDueToday, setTotalDueToday] = useState(0);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [expandedPriorities, setExpandedPriorities] = useState({});

  const handleTodoUpdate = useCallback(async () => {
    const fetchedTodos = await fetchAllTodosWithPriorities();

    setTodos(fetchedTodos);

    const { dueToday, overdue } = await calculateTodoCounts();

    setTotalDueToday(dueToday);
    setTotalOverdue(overdue);
  }, []);

  const handleToggleComplete = async (todo) => {
    const success = await toggleComplete("todos", todo.id, !todo.completed);
    if (success) {
      await handleTodoUpdate();
    }
  };

  useEffect(() => {
    handleTodoUpdate();
  }, [handleTodoUpdate]);

  const togglePriorityExpansion = (groupId, priorityId) => {
    setExpandedPriorities((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [priorityId]: !prev[groupId]?.[priorityId],
      },
    }));
  };

  const renderTodoGroup = (title, todos, priorityFilter) => {
    const filteredTodos = todos.filter(priorityFilter);

    if (filteredTodos.length === 0) {
      return null;
    }

    // Group todos by priority
    const priorityGroups = filteredTodos.reduce((groups, todo) => {
      const priority = todo.priority;
      if (!groups[priority.id]) {
        groups[priority.id] = {
          priority: priority,
          todos: [],
        };
      }
      groups[priority.id].todos.push(todo);
      return groups;
    }, {});

    // Sort priorityGroups based on the order in the priorities prop
    const sortedPriorityGroups = priorities
      .filter((priority) => priorityGroups[priority.id])
      .map((priority) => priorityGroups[priority.id]);

    const groupId = title.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <hr className="border-md border-indigo-deep mb-4" />{" "}
        {/* Added horizontal line */}
        {sortedPriorityGroups.map(({ priority, todos }) => (
          <div key={priority.id} className="mb-4">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => togglePriorityExpansion(groupId, priority.id)}
            >
              {expandedPriorities[groupId]?.[priority.id] ? (
                <ChevronDownIcon className="w-5 h-5 mr-2" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 mr-2" />
              )}
              <h3 className="text-md ">{priority.name}</h3>
            </div>
            {expandedPriorities[groupId]?.[priority.id] && (
              <div className="ml-7 mt-2 space-y-2">
                {todos.map((todo) => (
                  <ItemComponent
                    key={todo.id}
                    item={todo}
                    onToggleComplete={() => handleToggleComplete(todo)}
                    onUpdate={() => {
                      // Implement update functionality
                    }}
                    onDelete={() => {
                      // Implement delete functionality
                    }}
                    borderColor="border-indigo-600"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-2">Daily Plan</h1>
        <h2 className="text-lg mt-6">
          <span className="text-indigo-deep text-xl font-bold">
            {totalDueToday}
          </span>{" "}
          todos still due today and{" "}
          <span className="text-red-600 text-xl font-bold">{totalOverdue}</span>{" "}
          overdue
        </h2>
      </div>

      {renderTodoGroup(
        "Overdue",
        todos,
        (todo) => new Date(todo.due_date) < new Date(today)
      )}
      {renderTodoGroup("Due today", todos, (todo) => todo.due_date === today)}
      {renderTodoGroup(
        "Future",
        todos,
        (todo) => new Date(todo.due_date) > new Date(today)
      )}
    </div>
  );
};

export default DailyPlanView;
