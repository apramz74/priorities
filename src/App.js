import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "./index.css";
import HomeView from "./components/HomeView";
import PriorityView from "./components/PriorityView";
import MiscellaneousView from "./components/MiscellaneousView";
import WeeklyReportView from "./components/WeeklyReportView";
import { fetchPriorities, addPriority as apiAddPriority } from "./utils/api";
import Navigation from "./components/Navigation";

const PriorityManagementTool = () => {
  const [activeView, setActiveView] = useState({ type: "home" });
  const [priorities, setPriorities] = useState([]);
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
      setActiveView({ type: "priority", priority: newPriority });
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
      setActiveView({ type: "home" });
    }
  };

  const handleSelectView = (newView) => {
    setActiveView(newView);
  };

  const renderView = () => {
    switch (activeView.type) {
      case "home":
        return (
          <HomeView
            priorities={priorities}
            updatePriorities={updatePriorities}
            newPriorityName={newPriorityName}
            setNewPriorityName={setNewPriorityName}
            addPriority={addPriority}
            setActiveView={setActiveView}
            inputRef={inputRef}
          />
        );
      case "priority":
        return (
          <PriorityView
            selectedPriority={activeView.priority}
            updatePriorities={(updatedPriority) => {
              updatePriorities(updatedPriority);
              setActiveView((prev) => ({
                ...prev,
                priority: updatedPriority,
              }));
            }}
            setActiveView={setActiveView}
            activePrioritiesCount={
              priorities.filter(
                (p) => !p.completed && p.name !== "Miscellaneous"
              ).length
            }
          />
        );
      case "miscellaneous":
        return <MiscellaneousView setActiveView={setActiveView} />;
      case "weeklyReport":
        return <WeeklyReportView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FF] flex">
      <Navigation
        priorities={priorities}
        activeView={activeView}
        onSelectView={handleSelectView}
        addPriority={addPriority}
        updatePriorities={updatePriorities}
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
