import React, { useState, useEffect } from "react";
import TodoSection from "./TodoSection";
import { ensureMiscellaneousPriority, fetchMiscTodos } from "../utils/api";

const MiscellaneousView = ({
  setView,
  setSelectedPriority,
  selectedPriority,
}) => {
  const [todos, setTodos] = useState([]);
  const [priorityId, setPriorityId] = useState(null);

  useEffect(() => {
    const initializeMiscellaneous = async () => {
      const miscPriorityId = await ensureMiscellaneousPriority();
      setPriorityId(miscPriorityId);
      const miscTodos = await fetchMiscTodos();
      setTodos(miscTodos);
    };

    initializeMiscellaneous();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-black mb-4">Miscellaneous</h2>
      <TodoSection
        todos={todos}
        setTodos={setTodos}
        priorityId={priorityId || "misc"}
      />
    </div>
  );
};

export default MiscellaneousView;
