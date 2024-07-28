import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "./index.css";
import HomeView from "./components/HomeView";
import PriorityView from "./components/PriorityView";
import { fetchPriorities, addPriority as apiAddPriority } from "./utils/api";

const PriorityManagementTool = () => {
  const [view, setView] = useState("home");
  const [priorities, setPriorities] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [newPriorityName, setNewPriorityName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    fetchAndSetPriorities();
  }, []);

  async function fetchAndSetPriorities() {
    const data = await fetchPriorities();
    const activePriorities = data.filter((p) => !p.deleted);
    setPriorities(activePriorities);
  }

  async function addPriority() {
    const activePriorities = priorities.filter(
      (p) => !p.deleted && !p.completed
    );
    if (newPriorityName.trim() && activePriorities.length < 5) {
      const newPriority = await apiAddPriority(newPriorityName);
      if (newPriority) {
        setPriorities([...priorities, newPriority]);
        setNewPriorityName("");
      }
    }
  }

  const updatePriorities = (updatedPriorities) => {
    console.log("Updating priorities:", updatedPriorities);
    if (Array.isArray(updatedPriorities)) {
      setPriorities(updatedPriorities.filter((p) => !p.deleted));
    } else {
      setPriorities((prevPriorities) => {
        const updated = prevPriorities.map((p) =>
          p.id === updatedPriorities.id ? updatedPriorities : p
        );
        return updated.filter((p) => !p.deleted);
      });
    }

    if (updatedPriorities.deleted) {
      setSelectedPriority(null);
      setView("home");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Priority Management Tool</h1>
        {view === "home" ? (
          <HomeView
            priorities={priorities}
            updatePriorities={updatePriorities}
            newPriorityName={newPriorityName}
            setNewPriorityName={setNewPriorityName}
            addPriority={addPriority}
            setSelectedPriority={setSelectedPriority}
            setView={setView}
            inputRef={inputRef}
          />
        ) : (
          <PriorityView
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
            updatePriorities={updatePriorities}
            setView={setView}
          />
        )}
      </div>
    </div>
  );
};

export default PriorityManagementTool;
