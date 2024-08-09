import React, { useState, useEffect, useCallback } from "react";
import TodoSection from "./TodoSection";
import {
  fetchMiscTodos,
  addTodo,
  updateTodo,
  toggleDeleted,
  toggleComplete,
  fetchPriorities,
} from "../utils/api";

const MiscellaneousView = ({ setView, setSelectedPriority }) => {
  const [todos, setTodos] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const loadTodos = useCallback(async () => {
    const fetchedTodos = await fetchMiscTodos(showCompleted);
    setTodos(fetchedTodos);
  }, [showCompleted]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleToggleShowCompleted = () => {
    setShowCompleted((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Miscellaneous Tasks</h2>
        <div className="space-y-6 w-full">
          <TodoSection
            todos={todos}
            setTodos={setTodos}
            priorityId={29}
            showCompleted={showCompleted}
            onToggleShowCompleted={handleToggleShowCompleted}
          />
        </div>
      </div>
    </div>
  );
};

export default MiscellaneousView;
