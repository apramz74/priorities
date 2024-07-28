import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  updatePriority,
  deletePriority,
  togglePriorityCompletion,
  updatePriorityOrder,
} from "../utils/api";
import PencilIcon from "./PencilIcon";
import TrashIcon from "./TrashIcon";

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

const HomeView = ({
  priorities,
  updatePriorities,
  newPriorityName,
  setNewPriorityName,
  addPriority,
  setSelectedPriority,
  setView,
  inputRef,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const handleEdit = (priority) => {
    setEditingId(priority.id);
    setEditedName(priority.name);
  };

  const handleSave = async (priority) => {
    const updatedPriority = { ...priority, name: editedName };
    const success = await updatePriority(updatedPriority);
    if (success) {
      updatePriorities(updatedPriority);
      setEditingId(null);
    } else {
      console.error("Failed to update priority");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedName("");
  };

  const handleContextMenu = (e, priority) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      priorityId: priority.id,
    });
  };

  const handleDeletePriority = async () => {
    if (contextMenu) {
      const success = await deletePriority(contextMenu.priorityId);
      if (success) {
        updatePriorities({ id: contextMenu.priorityId, deleted: true });
      } else {
        console.error("Failed to delete priority");
      }
      setContextMenu(null);
    }
  };

  const handleToggleCompletion = async (priority) => {
    const success = await togglePriorityCompletion(
      priority.id,
      !priority.completed
    );
    if (success) {
      updatePriorities({ ...priority, completed: !priority.completed });
    } else {
      console.error("Failed to toggle priority completion");
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(priorities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedPriorities = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    updatePriorities(updatedPriorities);

    for (const priority of updatedPriorities) {
      await updatePriorityOrder(priority.id, priority.order);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredPriorities = priorities.filter(
    (priority) => !priority.deleted && (showCompleted || !priority.completed)
  );

  const activePriorities = priorities.filter(
    (priority) => !priority.deleted && !priority.completed
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Priorities</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show completed</span>
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                showCompleted ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                  showCompleted ? "translate-x-6" : ""
                }`}
              ></div>
            </div>
          </div>
        </div>
        <StrictModeDroppable droppableId="priorities">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {filteredPriorities.map((priority, index) => (
                <Draggable
                  key={priority.id}
                  draggableId={priority.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white p-4 rounded shadow hover:bg-gray-50 flex items-center ${
                        snapshot.isDragging ? "border-2 border-blue-500" : ""
                      } ${priority.completed ? "opacity-50" : ""}`}
                      onContextMenu={(e) => handleContextMenu(e, priority)}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="mr-2 cursor-move"
                      >
                        ☰
                      </div>
                      {editingId === priority.id ? (
                        <div className="flex items-center space-x-2 flex-grow">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="flex-grow border rounded px-2 py-1"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSave(priority)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 flex-grow">
                          <input
                            type="checkbox"
                            checked={priority.completed}
                            onChange={() => handleToggleCompletion(priority)}
                            className="mr-2"
                          />
                          <button
                            onClick={() => handleEdit(priority)}
                            className="text-gray-400 hover:text-blue-500 focus:outline-none"
                          >
                            <PencilIcon />
                          </button>
                          <span
                            onClick={() => {
                              setSelectedPriority(priority);
                              setView("priority");
                            }}
                            className={`cursor-pointer flex-grow ${
                              priority.completed ? "line-through" : ""
                            }`}
                          >
                            {priority.name}
                          </span>
                        </div>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </StrictModeDroppable>
        {activePriorities.length < 5 && (
          <div className="flex space-x-2">
            <input
              type="text"
              value={newPriorityName}
              onChange={(e) => setNewPriorityName(e.target.value)}
              placeholder="New priority name"
              className="flex-grow border rounded px-2 py-1"
              ref={inputRef}
            />
            <button
              onClick={addPriority}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
            >
              Add Priority
            </button>
          </div>
        )}
        {contextMenu && (
          <div
            className="absolute bg-white shadow-md rounded-md py-2 px-4"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={handleDeletePriority}
              className="flex items-center text-red-500 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default HomeView;
