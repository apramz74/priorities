import React, { useState, useEffect, useCallback } from "react";
import TodoSection from "./TodoSection";
import { fetchMiscTodos, ensureMiscellaneousPriority } from "../utils/api";

const MiscellaneousView = ({ setView, setSelectedPriority }) => {
  const [miscPriorityId, setMiscPriorityId] = useState(null);

  const loadMiscPriority = useCallback(async () => {
    const priorityId = await ensureMiscellaneousPriority();
    if (priorityId) {
      setMiscPriorityId(priorityId);
    } else {
      console.error("Failed to get or create Miscellaneous priority");
    }
  }, []);

  useEffect(() => {
    loadMiscPriority();
  }, [loadMiscPriority]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Miscellaneous Tasks</h2>
        {miscPriorityId && <TodoSection priorityId={miscPriorityId} />}
      </div>
    </div>
  );
};

export default MiscellaneousView;
