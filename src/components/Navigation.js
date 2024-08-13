import React, { useState, useEffect } from "react";
import logo from "./logo.png";
import { ReactComponent as MiscIcon } from "./misc_icon.svg";
import AddPriorityModal from "./AddPriorityModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ReactComponent as DragHandleIcon } from "./drag_handle_icon.svg";

const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
};

const Navigation = ({
  priorities,
  selectedPriority,
  onSelectPriority,
  onGoHome,
  setView,
  addPriority,
  updatePriorities,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrioritySlot, setNewPrioritySlot] = useState(null);
  const activePriorities = priorities.filter((priority) => !priority.completed);
  const handlePriorityClick = (priority) => {
    onSelectPriority(priority);
    setView("priority");
  };

  const handleMiscellaneousClick = () => {
    setView("miscellaneous");
  };

  const handleAddPriorityClick = (index) => {
    setNewPrioritySlot(index);
    setIsModalOpen(true);
  };

  const handleAddPriority = async (name) => {
    const newPriority = await addPriority(name, newPrioritySlot);
    if (newPriority) {
      onSelectPriority(newPriority);
      setView("priority");
    }
    setIsModalOpen(false);
    setNewPrioritySlot(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newActivePriorities = Array.from(activePriorities);
    const [reorderedItem] = newActivePriorities.splice(result.source.index, 1);
    newActivePriorities.splice(result.destination.index, 0, reorderedItem);

    const updatedPriorities = newActivePriorities.map((priority, index) => ({
      ...priority,
      order: index,
    }));

    updatePriorities(updatedPriorities);
  };

  return (
    <nav className="w-72 bg-white border-r border-gray-200 h-screen p-6 flex flex-col">
      <div className="mb-8">
        <button
          onClick={onGoHome}
          className="text-[#0000D1] font-extrabold text-xl flex items-center"
        >
          <img src={logo} alt="Prioritiez Logo" className="h-10 w-10 mr-2" />
          prioritiez
        </button>
      </div>

      <div className="h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Priorities</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <StrictModeDroppable droppableId="priorities">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 mb-2"
              >
                {[...Array(5)].map((_, index) => {
                  const priority = activePriorities[index];
                  return (
                    <Draggable
                      key={priority ? priority.id : `empty-${index}`}
                      draggableId={
                        priority ? priority.id.toString() : `empty-${index}`
                      }
                      index={index}
                      isDragDisabled={!priority}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="relative group"
                        >
                          {priority ? (
                            <button
                              onClick={() => handlePriorityClick(priority)}
                              className={`w-full text-left py-2 px-4 rounded flex items-center text-sm ${
                                selectedPriority?.id === priority.id
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <span className="font-black mr-6 w-6 flex-shrink-0">
                                P{index + 1}
                              </span>
                              <span className="font-medium truncate">
                                {priority.name}
                              </span>
                              <div
                                {...provided.dragHandleProps}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <DragHandleIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddPriorityClick(index)}
                              className="w-full text-left py-2 px-4 rounded flex items-center text-sm hover:bg-gray-100"
                            >
                              <span className="font-black mr-6 w-6 flex-shrink-0 text-black">
                                P{index + 1}
                              </span>
                              <span className="font-medium text-[#0000D1] truncate">
                                Add priority
                              </span>
                            </button>
                          )}
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </StrictModeDroppable>
        </DragDropContext>

        <button
          onClick={handleMiscellaneousClick}
          className="w-full text-left py-2 px-4 rounded text-gray-600 hover:bg-gray-100 flex items-center text-sm mt-2"
        >
          <MiscIcon className="w-5 h-5 mr-6" />
          <span className="font-medium">Miscellaneous</span>
        </button>
      </div>
      {isModalOpen && (
        <AddPriorityModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddPriority}
          slot={newPrioritySlot + 1}
        />
      )}
    </nav>
  );
};

export default Navigation;
