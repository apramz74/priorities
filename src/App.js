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
            setSelectedPriority={setSelectedPriority}
            updatePriorities={updatePriorities}
            setView={handleSetView}
          />
        );
      case "miscellaneous":
        return (
          <MiscellaneousView
            setView={handleSetView}
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
