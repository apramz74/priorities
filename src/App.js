import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "./index.css";
import HomeView from "./components/HomeView";
import PriorityView from "./components/PriorityView";
import MiscellaneousView from "./components/MiscellaneousView";
import { fetchPriorities, addPriority as apiAddPriority } from "./utils/api";
import Navigation from "./components/Navigation";

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

  async function addPriority(name, slot) {
    const newPriority = await apiAddPriority(name, slot);
    if (newPriority) {
      setPriorities((prevPriorities) => {
        const activePriorities = prevPriorities.filter(
          (p) => !p.deleted && !p.completed
        );
        const completedPriorities = prevPriorities.filter((p) => p.completed);
        const updatedActivePriorities = [...activePriorities];
        updatedActivePriorities.splice(slot, 0, newPriority);
        return [...updatedActivePriorities.slice(0, 5), ...completedPriorities];
      });
      setSelectedPriority(newPriority);
      setView("priority");
    }
    return newPriority;
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

  const handleSelectPriority = (priority) => {
    setSelectedPriority(priority);
    setView("priority");
  };

  const handleGoHome = () => {
    setSelectedPriority(null);
    setView("home");
  };

  const handleSetView = (newView) => {
    setView(newView);
    if (newView === "miscellaneous") {
      setSelectedPriority(null);
    }
  };

  const renderView = () => {
    switch (view) {
      case "home":
        return (
          <HomeView
            priorities={priorities}
            updatePriorities={updatePriorities}
            newPriorityName={newPriorityName}
            setNewPriorityName={setNewPriorityName}
            addPriority={addPriority}
            setSelectedPriority={setSelectedPriority}
            setView={handleSetView}
            inputRef={inputRef}
          />
        );
      case "priority":
        return (
          <PriorityView
            selectedPriority={selectedPriority}
            updatePriorities={updatePriorities}
            setView={setView}
            setSelectedPriority={setSelectedPriority}
            activePrioritiesCount={
              priorities.filter((p) => !p.completed).length
            }
          />
        );
      case "miscellaneous":
        return (
          <MiscellaneousView
            setView={setView}
            setSelectedPriority={setSelectedPriority}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FF] flex">
      <Navigation
        priorities={priorities}
        selectedPriority={selectedPriority}
        onSelectPriority={handleSelectPriority}
        onGoHome={handleGoHome}
        setView={handleSetView}
        addPriority={addPriority}
        setSelectedPriority={setSelectedPriority}
      />
      <div className="flex-grow overflow-auto">
        <div className="max-w-6xl min-w-[1000px] mx-auto p-4">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default PriorityManagementTool;
