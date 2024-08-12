import React, { useState, useRef, useEffect } from "react";
import TrashIcon from "./TrashIcon";
import { ReactComponent as CalendarIcon } from "../components/calendar_icon.svg";

const EditableField = ({ value, onUpdate, type = "text", className = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onUpdate(editValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          setIsEditing(false);
          onUpdate(editValue);
        }}
        onKeyDown={handleKeyDown}
        className={`border rounded px-2 py-1 ${className} ${
          type === "date" ? "w-auto" : "w-full"
        }`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer ${className}`}
    >
      {value}
    </div>
  );
};

const ItemComponent = ({
  item,
  onToggleComplete,
  borderColor,
  onUpdate,
  itemType,
  onDelete,
}) => {
  const isDependency = itemType === "dependency";
  const [contextMenu, setContextMenu] = useState(null);

  const getDueDateColor = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);

    if (dueDateObj < today) {
      return "#FF0000";
    } else if (dueDateObj.getTime() === today.getTime()) {
      return "#FFA800";
    }
    return "currentColor";
  };

  const dueDateColor = getDueDateColor(item.due_date);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDelete = () => {
    onDelete(item.id);
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      className={`flex items-center p-3 bg-white border ${borderColor} rounded-lg
                  hover:bg-[#E5E5FF] hover:shadow-[0_0_10px_rgba(0,0,209,0.3)] transition-all duration-200 min-h-[65px] relative`}
      onContextMenu={handleContextMenu}
    >
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggleComplete(item.id)}
        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 mr-3"
      />
      <div className="flex-grow pr-32">
        <EditableField
          value={isDependency ? item.title : item.name}
          onUpdate={(value) =>
            onUpdate(item.id, isDependency ? "title" : "name", value)
          }
          className="text-sm font-medium"
        />
        <EditableField
          value={isDependency ? item.person : item.notes}
          onUpdate={(value) =>
            onUpdate(item.id, isDependency ? "person" : "notes", value)
          }
          className="text-xs text-gray-500"
        />
      </div>
      <div
        className="flex items-center absolute right-3 top-1/2 transform -translate-y-1/2 w-28"
        style={{ color: dueDateColor }}
      >
        <CalendarIcon className="w-4 h-4 absolute left-0" />
        <EditableField
          value={item.due_date}
          onUpdate={(value) => onUpdate(item.id, "due_date", value)}
          type="date"
          className="text-xs w-full pl-6"
        />
      </div>
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-md py-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-semibold font-inter"
            onClick={handleDelete}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemComponent;
